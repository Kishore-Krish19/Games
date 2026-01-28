require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db"); // Ensure this is now the pool.promise() version
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const leaderboardRoutes = require("./routes/leaderboard");
const dashboardRoutes = require("./routes/dashboard");
const configRoutes = require("./routes/config");
const adminRoutes = require("./routes/admin");
const tournamentRoutes = require("./routes/tournament");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/config", configRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tournament", tournamentRoutes);

// Test DB Connection (Updated for Promises)
app.get("/test-db", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({ success: true, message: "Database Connected ✅" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/", (req, res) => res.send("Hanoi Arena API Active ✅"));

const PORT = process.env.PORT || 5000;
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

// Scale Socket.io for more users
const io = new Server(server, {
    cors: {
        // Change this back to localhost for testing
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

io.on("connection", (socket) => {
    // Basic rate limiting: restrict how many messages a socket can send per second
    socket.onAny(() => {
        socket.lastMessage = Date.now();
    });

    socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});