# 🎓 SQI Quiz

> **A sleek, real-time interactive quiz platform built for classrooms, workshops, and team game nights.**

Inspired by Kahoot, **SQI Quiz** is an open-source, full-stack live multiplayer quiz engine. It combines a distraction-free, professional aesthetic (Deep Navy Blue `#0A1128`, crisp white, and matte accents) with zero-latency WebSockets and tactile mobile controls.

[![Live Demo](https://img.shields.io/badge/Live_Demo-sqi--quiz.onrender.com-2563EB?style=for-the-badge&logo=render)](https://sqi-quiz.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-059669.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4-010101?style=for-the-badge&logo=socketdotio)](https://socket.io)

---

## 🎮 Try It Live!

You can test the platform right now without installing anything:

* **📱 Player Screen (Mobile / Desktop)**:  
  👉 **[https://sqi-quiz.onrender.com](https://sqi-quiz.onrender.com)**

* **🖥️ Host Projector & Dashboard**:  
  👉 **[https://sqi-quiz.onrender.com/?role=host](https://sqi-quiz.onrender.com/?role=host)**

---

## 🌟 Key Highlights

### 📱 For Players (Mobile Phone Controller)
* **Solid Tactile Pads**: Bold, full-bleed color pads (Red, Blue, Amber, Green / True & False) with touch press physics.
* **Instant Lock-In**: As soon as you tap, your answer locks in immediately with a `LOCKED` badge and green confirmation.
* **Live Floating Reactions**: Tap emojis (🔥, 🚀, 👏, 💡, 🤯) that float across the classroom projector with your player name tag attached!
* **Session Persistence**: Reconnects automatically if you refresh or switch apps during a game.

### 🖥️ For Hosts & Classrooms (Big Screen Projector)
* **High-Adrenaline 5s Countdown**: A suspenseful, dramatic countdown with audio cues before Question 1 begins.
* **Dual Visual Timer**: Continuous measuring progress bar + capsule gauge that auto-cuts the instant all active players have answered.
* **Dynamic Kahoot-Style Leaderboard**: Between questions, scores physically roll up from previous totals, and player cards swap positions live on screen!
* **Suspenseful 3D Podium**: A theatrical 3rd ➔ 2nd ➔ 1st place reveal with drumrolls, spotlights, crown animations, and victory confetti.
* **Post-Game Analytics**: Class accuracy breakdown, "Toughest Question" spotlight, and 1-click CSV spreadsheet export.

### 👥 Easy Joining
* **PIN & Dynamic QR Code**: Players join in seconds by scanning the projector screen.
* **1-Click Invite Link**: Instant clipboard copy button in the lobby for sharing over WhatsApp, Discord, or Slack.
* **Host Moderation**: Remove disruptive nicknames from the lobby with one click.

---

## 🚀 Running Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* `npm`

### 1. Clone & Install
```bash
git clone https://github.com/Jeremiahtec/sqi-quiz.git
cd sqi-quiz
```

### 2. Start the Servers
In Terminal 1 (WebSocket Server on port 3001):
```bash
npm run server
```

In Terminal 2 (Vite Client on port 5173):
```bash
npm run client
```

* **Host Dashboard**: [http://localhost:5173/?role=host](http://localhost:5173/?role=host)
* **Player View**: [http://localhost:5173/](http://localhost:5173/)

---

## 🌐 1-Click Deployment (Render / Railway / VPS)

The server is architected for **single-port unified deployment** — Express serves both the real-time WebSocket engine and the production React frontend on one domain with zero CORS setup.

### Deploy on Render:
1. Connect your GitHub repository to [Render](https://dashboard.render.com/).
2. Choose **Web Service** with the following settings:
   * **Runtime**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
3. Click **Deploy** — your live quiz service is up and running!

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Canvas Confetti
* **Backend**: Node.js, Express, Socket.io
* **Audio**: Native Web Audio API (zero external audio files or network lag)
* **Architecture**: Monorepo with unified single-port static asset serving

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built for [SQI College of ICT](https://edu.sqi.ng).
