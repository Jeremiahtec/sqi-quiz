# 🎓 SQI Quiz — Real-Time Interactive Classroom Quiz Platform

A modern, minimalist, real-time multiplayer quiz game built for classrooms, workshops, and competitions. Designed with SQI College of ICT's brand aesthetics (Deep Navy Blue `#0A1128`, crisp white, and tasteful matte color accents).

---

## 🌟 Key Features

### 🖥️ Host Projector View
- **Dual Visual Countdown**: Smooth continuous countdown measuring bar across the screen + capsule timer gauge with audio tick cues.
- **Dynamic Question Types**: Supports Multiple Choice (2–4 options), True/False, and Open-Ended questions with typing notices.
- **Code & Diagrams**: Embedded syntax-highlighted code snippets and diagram imagery.
- **Instant Auto-Reveal**: Automatically cuts the countdown timer the instant all active players answer.
- **Educational Takeaways**: Post-question key takeaways and answer explanations.
- **Post-Game Analytics**: Class accuracy spotlight, hardest question breakdown, and CSV report export.

### 📱 Player Mobile Controller
- **Solid Tactile Color Pads**: High-contrast, rich color pads (Red, Blue, Amber, Green) with large geometric icons and responsive touch press feedback.
- **Instant Answer Lock-In**: Tapping an answer pad locks in immediately, turns the timer to `LOCKED`, and displays a confirmed submission badge.
- **Live Floating Reactions**: Players can tap reaction emojis (🔥, 👏, 🚀, 💡, 🤯) that float across the projector in real time.
- **Session Recovery**: Automatic reconnection if a player refreshes or toggles tabs.

### 👥 Host Lobby & Moderation
- **PIN & Dynamic QR Code**: Players can scan to join directly on mobile.
- **1-Click Invite Link**: Instant copy button for easy sharing via WhatsApp, Slack, or Teams.
- **Player Moderation**: Host can click any player's chip to remove them from the lobby.
- **Audio Effects**: Built-in Web Audio chime synthesizers with individual host/player mute toggles.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Start Development Servers
In terminal 1 (Backend WebSocket server on port 3001):
```bash
cd server && npm run dev
```

In terminal 2 (Vite Frontend on port 5173):
```bash
cd client && npm run dev
```

- **Host Dashboard**: [http://localhost:5173/?role=host](http://localhost:5173/?role=host)
- **Player View**: [http://localhost:5173/](http://localhost:5173/)

---

## 🌐 1-Click Production Deployment (Render / Railway / VPS)

The server is built to serve both the WebSocket backend and the production React frontend on a **single unified port**, eliminating CORS issues.

### Deployment on Render / Railway
1. **Repository**: Push this repo to GitHub.
2. **Create Web Service**: Select your repo.
3. **Build Command**: `npm run build` (builds the client into `client/dist`).
4. **Start Command**: `npm start` (runs `node server/index.js`).
5. **Environment Variables**:
   - `PORT`: Automatically set by cloud hosts (e.g., `10000` or `3001`).
   - `NODE_ENV`: `production`.

Once deployed, visit your assigned domain (e.g. `https://your-sqi-quiz.onrender.com`).
- Add `?role=host` to access the Host dashboard.
- Regular visitors automatically see the Player join screen.
