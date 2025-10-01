const path = require('path');
const dotenv = require('dotenv');
// Load env regardless of where node is invoked from
dotenv.config({ path: path.join(__dirname, 'config.env') });
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
const Player = require('./models/playerModel');
const Team = require('./models/teamModel');
const AppConfig = require('./models/appConfigModel');

const PORT = process.env.PORT || 5000;
console.log('[Config] Using PORT =', PORT);
const Database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(Database)
  .then(() => console.log('DB Connection Successful'))
  .catch((err) => console.error('DB Connection Error', err));

// Create HTTP server from express app
const httpServer = http.createServer(app);

// Initialize Socket.IO with flexible CORS (allow LAN/mobile dev origins)
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow all origins during development (could restrict with env in future)
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in express routes via req.app.get('io')
app.set('io', io);

// Permissive auth middleware: verify JWT if provided, else allow guest
io.use(async (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token;
    if (token) {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Check global invalidation timestamp
      const cfg = await AppConfig.findOne();
      if (cfg && cfg.sessionsInvalidatedAt) {
        const issuedAtMs = (decoded.iat || 0) * 1000;
        if (issuedAtMs < new Date(cfg.sessionsInvalidatedAt).getTime()) {
          return next(); // treat as guest (no user attached)
        }
      }
      if (decoded?.id) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          socket.user = user; // attach full user
        }
      }
    }
  } catch (err) {
    // Silently ignore errors to allow guest connection
  } finally {
    next(); // Always continue
  }
});

io.on('connection', (socket) => {
  console.log(
    '[Socket] Client connected id=%s authUser=%s role=%s team=%s',
    socket.id,
    socket.user?.name,
    socket.user?.role,
    socket.user?.team
  );
  // On connect, send currently in_auction player (if any) for late joiners / refresh
  (async () => {
    try {
      const live = await Player.findOne({ status: 'in_auction' })
        .populate({ path: 'bidHistory.team', select: 'name' })
        .populate({ path: 'team', select: 'name' });
      if (live) {
        let plain = live.toObject({ getters: true, virtuals: false });
        if (Array.isArray(plain.bidHistory)) {
          plain.bidHistory = plain.bidHistory.map((b) => ({
            ...b,
            teamName: b.team?.name || b.teamName || 'Unknown Team',
          }));
        }
        if (plain.team && plain.team.name) plain.teamName = plain.team.name;
        socket.emit('new_player', plain);
      }
    } catch (e) {
      // ignore sync errors
    }
  })();

  // Helper to compute next bid using tiered increments
  // Rules: current < 5 => +0.25, 5 <= current < 10 => +0.5, current >= 10 => +1
  const computeNextBid = (current) => {
    if (current == null) {
      console.log('[Bid] computeNextBid aborted: current is null/undefined');
      return null;
    }
    const n = Number(current);
    if (Number.isNaN(n)) {
      console.log(
        '[Bid] computeNextBid aborted: current not a number value=%o',
        current
      );
      return null;
    }
    let inc;
    if (n < 5) inc = 0.25;
    else if (n < 10) inc = 0.5;
    else inc = 1;
    const next = Number((n + inc).toFixed(2));
    console.log('[Bid] computeNextBid current=%s inc=%s next=%s', n, inc, next);
    return next;
  };

  // Captain places a bid
  socket.on('captain:place_bid', async () => {
    try {
      console.log(
        '[Bid] Event captain:place_bid received socket=%s user=%s role=%s team=%s',
        socket.id,
        socket.user?.name,
        socket.user?.role,
        socket.user?.team
      );
      // Auth & role check (only captain role supported now)
      if (!socket.user || socket.user.role !== 'captain') {
        socket.emit('server:bid_error', {
          message: 'Not authorized (captain only)',
        });
        console.log('[Bid] Rejected: not authorized');
        return;
      }
      if (!socket.user.team) {
        socket.emit('server:bid_error', {
          message: 'No team assigned to user',
        });
        console.log('[Bid] Rejected: user has no team');
        return; // must be associated to a team
      }

      // Find current player in auction
      const livePlayer = await Player.findOne({ status: 'in_auction' });
      if (!livePlayer) {
        socket.emit('server:bid_error', { message: 'No active player' });
        console.log('[Bid] Rejected: no active player in_auction');
        return; // no active player => ignore
      }
      console.log(
        '[Bid] Live player found id=%s name=%s basePrice=%s bids=%d',
        livePlayer._id,
        livePlayer.name,
        livePlayer.basePrice,
        livePlayer.bidHistory?.length || 0
      );

      // Determine currentHighestBid (last bid or basePrice if none), then apply tiered increment
      const hasHistory =
        Array.isArray(livePlayer.bidHistory) &&
        livePlayer.bidHistory.length > 0;
      let currentHighestBid;
      if (hasHistory) {
        currentHighestBid =
          livePlayer.bidHistory[livePlayer.bidHistory.length - 1].bidAmount; // last bid
        console.log('[Bid] Current highest from history=%s', currentHighestBid);
        // Block if last bid already from this team
        const lastTeamId = (
          livePlayer.bidHistory[livePlayer.bidHistory.length - 1].team || ''
        ).toString();
        if (lastTeamId === socket.user.team.toString()) {
          socket.emit('server:bid_error', {
            message: 'You already hold the highest bid',
          });
          console.log(
            '[Bid] Rejected: same team consecutive bid team=%s',
            lastTeamId
          );
          return;
        }
      } else {
        currentHighestBid = Number(livePlayer.basePrice);
        console.log(
          '[Bid] No history; using basePrice as current=%s',
          currentHighestBid
        );
      }
      currentHighestBid = Number(currentHighestBid);
      if (Number.isNaN(currentHighestBid)) currentHighestBid = 0;
      let desiredBidAmount;
      if (hasHistory) {
        desiredBidAmount = computeNextBid(currentHighestBid);
        if (desiredBidAmount == null) {
          console.log(
            '[Bid] Aborted: desiredBidAmount null after computeNextBid'
          );
          return;
        }
        console.log('[Bid] desiredBidAmount (tiered)=%s', desiredBidAmount);
      } else {
        // First bid equals the base price (no increment)
        desiredBidAmount = Number(livePlayer.basePrice) || 0;
        console.log(
          '[Bid] desiredBidAmount (first bid basePrice)=%s',
          desiredBidAmount
        );
      }

      // Load team & check budget
      const team = await Team.findById(socket.user.team);
      if (!team) {
        socket.emit('server:bid_error', { message: 'Team not found' });
        console.log('[Bid] Rejected: team not found id=%s', socket.user.team);
        return;
      }
      if (team.budget == null || team.budget < desiredBidAmount) {
        socket.emit('server:bid_error', { message: 'Insufficient funds' });
        console.log(
          '[Bid] Rejected: insufficient funds budget=%s needed=%s',
          team.budget,
          desiredBidAmount
        );
        return;
      }
      console.log('[Bid] Team budget OK budget=%s', team.budget);

      // Apply bid with minimal DB roundtrips
      const updRes = await Player.updateOne(
        { _id: livePlayer._id },
        {
          $push: {
            bidHistory: {
              team: team._id,
              bidAmount: desiredBidAmount,
            },
          },
          $set: {
            finalBidPrice: desiredBidAmount,
            team: team._id, // leading team reference
          },
        }
      );

      if (!updRes || updRes.modifiedCount === 0) {
        socket.emit('server:bid_error', {
          message: 'Bid race condition, retry',
        });
        console.log('[Bid] Rejected: race condition after update');
        return; // race condition safeguard
      }
      console.log(
        '[Bid] Bid persisted playerId=%s finalBidPrice=%s leadingTeam=%s',
        livePlayer._id,
        desiredBidAmount,
        team.name || team._id
      );

      // Load updated player (minimal fields) so clients can update bidHistory/UI state
      let updatedPlayer;
      try {
        updatedPlayer = await Player.findById(livePlayer._id)
          .select(
            'name image category year basePrice status team finalBidPrice bidHistory'
          )
          .populate({ path: 'bidHistory.team', select: 'name' })
          .populate({ path: 'team', select: 'name' });
      } catch (_) {}

      // Prepare broadcast payload
      const payload = {
        playerId: livePlayer._id.toString(),
        finalBidPrice: desiredBidAmount,
        leadingTeam: { id: team._id.toString(), name: team.name },
        // convenience: the latest bid extracted separately
        latestBid: {
          teamId: team._id.toString(),
          teamName: team.name,
          bidAmount: desiredBidAmount,
          timestamp: Date.now(),
        },
      };
      if (updatedPlayer) {
        let plain = updatedPlayer.toObject({ getters: true, virtuals: false });
        if (Array.isArray(plain.bidHistory)) {
          plain.bidHistory = plain.bidHistory.map((b) => ({
            ...b,
            teamName: b.team?.name || b.teamName || 'Unknown Team',
          }));
        }
        if (plain.team && plain.team.name) plain.teamName = plain.team.name;
        payload.player = plain; // full snapshot for UI merge
        payload.bidHistoryLength = Array.isArray(plain.bidHistory)
          ? plain.bidHistory.length
          : 0;
      }
      io.emit('server:new_bid', payload); // broadcast to all including bidder
      console.log(
        '[Bid] Broadcast server:new_bid amount=%s playerId=%s',
        desiredBidAmount,
        livePlayer._id
      );
    } catch (err) {
      console.error('[Bid] Unexpected error:', err);
      socket.emit('server:bid_error', { message: 'Bid failed' });
    }
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Listen on 0.0.0.0 so that LAN/mobile devices can reach the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`DGPL Auction server listening on ${PORT} (0.0.0.0)`);
});

module.exports = { app, io, httpServer };
