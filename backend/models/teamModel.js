const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    unique: true,
    trim: true,
  },
  captain: {
    type: mongoose.Schema.ObjectId,
    ref: 'Player',
  },
  image: {
    type: String,
  },
  budget: {
    type: Number,
    default: 100,
  },
  players: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Player',
    },
  ],
});

// Index to speed up captain lookups
teamSchema.index({ captain: 1 });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
