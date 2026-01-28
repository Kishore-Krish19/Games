# 🏆 Hanoi Arena – Multiplayer Tower of Hanoi Tournament System

Hanoi Arena is a full-stack web application that allows multiple players to participate in Tower of Hanoi tournaments in real time.  
It includes authentication, admin controls, tournament scheduling, live leaderboard, and secure gameplay.

---

## 📌 Features

### 👤 User
- Register & Login (Username + Password)
- Play Tower of Hanoi
- Join scheduled tournaments
- Live countdown before game starts
- Auto-lock before/after tournament
- View leaderboard
- View brackets

### 👑 Admin
- Manage number of disks
- Create tournaments
- Schedule start time
- Control rounds
- Qualify players
- End tournaments
- View and manage players
- Ban/Delete players
- Clear Tournaments from DB
- Clear Leaderboard

### ⚙️ System
- JWT Authentication
- Role-based access (Admin / Player)
- MySQL Database
- Real-time leaderboard (Socket.IO)
- Secure game locking
- Server-synced timers

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- React Router
- Framer Motion
- Socket.IO Client
- CSS

### Backend
- Node.js
- Express.js
- MySQL (XAMPP)
- JWT
- bcrypt
- Socket.IO

### Database
- MySQL (MariaDB)

---

## 📁 Project Structure

```
GAME/
│
├── hanoi-backend/
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── server.js
│ └── .env
│
├── hanoi-frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── components/
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── package.json
│
└── README.md
```

📊 Tournament Workflow:

Admin creates tournament
        ↓
Status: pending
        ↓
Countdown starts
        ↓
Status: active
        ↓
Game unlocked
        ↓
Status: ended
        ↓
Leaderboard finalized
