const db = require("../config/db");

// START GAME
exports.startGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const startTime = new Date();

        const [result] = await db.query(
            "INSERT INTO games (user_id, start_time) VALUES (?, ?)",
            [userId, startTime]
        );

        res.json({
            message: "Game started ✅",
            gameId: result.insertId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// END GAME
exports.endGame = async (req, res) => {
    const userId = req.user.id;
    const { gameId, moves } = req.body;

    try {
        const [result] = await db.query(
            "SELECT start_time FROM games WHERE id=? AND user_id=?",
            [gameId, userId]
        );

        if (result.length === 0) return res.status(404).json({ message: "Game not found" });

        const startTime = result[0].start_time;
        const endTime = new Date();
        const timeTaken = Math.floor((endTime - startTime) / 1000);

        // Use a consistent score formula
        const score = Math.max(0, 10000 - (timeTaken * 10) - (moves * 5));

        await db.query(
            "UPDATE games SET end_time=?, moves=?, time_taken=?, score=? WHERE id=?",
            [endTime, moves, timeTaken, score, gameId]
        );

        const io = req.app.get("io");
        io.emit("scoreUpdate");

        res.json({ message: "Game finished ✅", timeTaken, moves, score });
    } catch (err) {
        res.status(500).json(err.message);
    }
};
