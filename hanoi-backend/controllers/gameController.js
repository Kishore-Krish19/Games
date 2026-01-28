const db = require("../config/db");

// START GAME
exports.startGame = (req, res) => {
    const userId = req.user.id;

    const startTime = new Date();

    db.query(
        "INSERT INTO games (user_id, start_time) VALUES (?, ?)",
        [userId, startTime],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                message: "Game started ✅",
                gameId: result.insertId
            });
        }
    );
};

// END GAME
exports.endGame = (req, res) => {
    const userId = req.user.id;
    const { gameId, moves } = req.body;

    if (!gameId || !moves) {
        return res.status(400).json({
            message: "gameId and moves required"
        });
    }

    // Get start time
    db.query(
        "SELECT start_time FROM games WHERE id=? AND user_id=?",
        [gameId, userId],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Game not found"
                });
            }

            const startTime = result[0].start_time;
            const endTime = new Date();

            const timeTaken =
                Math.floor((endTime - startTime) / 1000);

            // Score Formula (adjust later)
            const score = Math.max(
                0,
                10000 - timeTaken * 10 - moves * 5
            );

            // Update game
            db.query(
                `UPDATE games 
         SET end_time=?, moves=?, time_taken=?, score=? 
         WHERE id=?`,
                [endTime, moves, timeTaken, score, gameId],
                (err) => {
                    if (err) return res.status(500).json(err);

                    // Emit leaderboard update
                    const io = req.app.get("io");
                    io.emit("scoreUpdate");

                    res.json({
                        message: "Game finished ✅",
                        timeTaken,
                        moves,
                        score
                    });

                }
            );
        }
    );
};
