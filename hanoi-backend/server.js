require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
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
app.use("/api/config", configRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tournament", tournamentRoutes);

// Test DB Connection
app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Database Connected ✅"
        });
    });
});

// Root
app.get("/", (req, res) => {
    res.send("Hanoi Backend Running ✅");
});

const PORT = process.env.PORT || 5000;

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});

// Make io available globally
app.set("io", io);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
