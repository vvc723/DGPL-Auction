# DGPL Auction - Real-Time Player Auction Platform

🔗 **[Live Demo](https://dgpl-auction.com)** <!-- Replace with your actual live URL -->

## Introduction

DGPL Auction is a full-stack, real-time web application designed to digitize and streamline the player auction process for the Dussehra Gulteez Premier League (DGPL), a cricket tournament organized by the Telugu student community at MNIT Jaipur. This project replaces the traditional manual auction with a secure, engaging, and interactive online platform, enabling seamless management and participation for admins, team captains, and viewers.

Built to solve a real-world problem, this application transforms the auction experience from a chaotic offline process into a smooth, transparent, and exciting digital event that brings the community together.

---

## 📸 Screenshots / Demo

> _Add screenshots or GIFs here to showcase the application UI and features._

### Live Auction View

![Live Auction](./screenshots/live-auction.png)
_Real-time bidding interface with live updates_

### Auction Summary Dashboard

![Auction Summary](./screenshots/auction-summary.png)
_Comprehensive dashboard showing team rosters and recent bids_

### Admin Panel

![Admin Panel](./screenshots/admin-panel.png)
_Powerful admin controls for managing the auction flow_

---

## ✨ Key Features

- **🔴 Real-Time Bidding**  
  Live updates for all users using Socket.IO, ensuring everyone sees the latest bids instantly

- **👥 Role-Based Access Control**  
  Distinct roles for Admin, Team Captain, and Public Viewer, each with tailored permissions and UI

- **🔐 Secure JWT Authentication**  
  Robust login and session management using JSON Web Tokens with bcrypt password hashing

- **⚙️ Admin Control Panel**  
  Comprehensive tools for managing auction flow, including player selection, selling, and marking unsold

- **🎯 Dynamic Admin UI**  
  Filter and manage players by year with intuitive controls and batch operations

- **📊 Live Auction Summary Dashboard**  
  Real-time team statistics, player rosters, recent bids, and comprehensive auction analytics

- **👤 Detailed Player Profiles**  
  Individual pages with player stats, images, bid history, and team assignments

- **📱 Mobile-First, Responsive Design**  
  Optimized for all devices using Tailwind CSS with dark theme support

- **🏏 Team Management**  
  Complete team roster management with captain assignments and budget tracking

- **⚡ Performance Optimized**  
  Fast loading with efficient data fetching and real-time synchronization

---

## 🛠️ Tech Stack

### Frontend

- **[React](https://react.dev/)** (Vite) - Modern React development with fast HMR
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **Context API** - State management for authentication and global state
- **[Socket.IO Client](https://socket.io/)** - Real-time bidirectional communication

### Backend

- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment
- **[Express.js](https://expressjs.com/)** - Fast, minimalist web framework
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling for Node.js
- **[Socket.IO](https://socket.io/)** - Real-time engine for live updates
- **[JWT](https://jwt.io/)** - JSON Web Token authentication
- **[bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing library

### Database

- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Cloud database service

### Deployment & Infrastructure

- **[Vercel](https://vercel.com/)** - Frontend deployment platform
- **[DigitalOcean](https://www.digitalocean.com/)** - Backend server hosting
- **[Cloudflare](https://www.cloudflare.com/)** - DNS management and security
- **[Nginx](https://nginx.org/)** - Reverse proxy and web server
- **[PM2](https://pm2.keymetrics.io/)** - Production process manager

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB Atlas account (or local MongoDB installation)

### 1. Clone the Repository

```bash
git clone https://github.com/vvc723/DGPL-Auction.git
cd DGPL-Auction
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file
cp config.env.example config.env
# Edit config.env with your MongoDB URI and other secrets

# Start the backend server in development mode
npm run dev

# Or start in production mode
npm start
```

The backend server will run on `http://localhost:7777`

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file for development
cp .env.development.example .env.development
# Edit .env.development with your API URL

# Start the frontend development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Additional Setup (Optional)

```bash
# If you want to seed the database with sample data
cd backend
npm run seed
```

---

## 🔧 Environment Variables

### Backend Configuration (`backend/config.env`)

Create a `config.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=7777
NODE_ENV=development

# Database
DATABASE=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dgpl-auction?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Optional: Additional security keys
BCRYPT_SALT_ROUNDS=12
```

### Frontend Configuration (`frontend/.env.development`)

Create a `.env.development` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:7777

# Socket.IO Configuration
VITE_SOCKET_URL=http://localhost:7777

# Optional: Enable development features
VITE_DEV_MODE=true
```

### Production Frontend Configuration (`frontend/.env.production`)

For production builds, create a `.env.production` file:

```env
# Production API Configuration
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

---

## 📁 Project Structure

```
DGPL-Auction/
├── backend/
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose schemas
│   ├── routers/           # Express routes
│   ├── utils/             # Utility functions
│   ├── app.js             # Express app configuration
│   ├── server.js          # Server entry point
│   └── config.env         # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   └── utils/         # Frontend utilities
│   ├── public/           # Static assets
│   └── .env.development  # Frontend environment variables
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational and community use. Please contact the maintainer for commercial or large-scale deployment permissions.

---

## 🙏 Acknowledgements

- **DGPL Organizers** - For providing the real-world problem that inspired this solution
- **MNIT Jaipur Telugu Student Community** - For their support and feedback
- **Open Source Community** - For the amazing tools and libraries that made this possible

---

## 📞 Contact

**Project Maintainer:** [vvc723](https://github.com/vvc723)

For questions, suggestions, or contributions:

- 📧 Open an issue on GitHub
- 💬 Reach out via GitHub discussions

---

## 🔗 Links

- [Live Demo](https://your-live-url-here.com)
- [Backend API Docs](https://your-backend-domain.com/api-docs)
- [Project Repository](https://github.com/vvc723/DGPL-Auction)

---

_Built with ❤️ for the DGPL community_
