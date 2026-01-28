const db = require("../config/db");

// GET PLAYERS
exports.getPlayers = (req, res) => {
    const sql = `
    SELECT 
     u.id,
     u.username,
     u.role,
     u.is_banned,
     COUNT(g.id) AS games,
     MAX(g.score) AS bestScore
    FROM users u
    LEFT JOIN games g ON u.id = g.user_id
    WHERE u.role = 'player'
    GROUP BY u.id
    ORDER BY bestScore DESC
  `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);

        res.json(result);
    });
};

// DELETE PLAYER
exports.deletePlayer = (req, res) => {
    const userId = req.params.id;

    // Prevent deleting admins
    db.query(
        "SELECT role FROM users WHERE id=?",
        [userId],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (!result.length) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (result[0].role === "admin") {
                return res.status(403).json({
                    message: "Cannot delete admin"
                });
            }

            // Delete user's games
            db.query(
                "DELETE FROM games WHERE user_id=?",
                [userId],
                () => {

                    // Delete tournament results
                    db.query(
                        "DELETE FROM tournament_results WHERE user_id=?",
                        [userId],
                        () => {

                            // Delete qualifiers
                            db.query(
                                "DELETE FROM tournament_qualifiers WHERE user_id=?",
                                [userId],
                                () => {

                                    // Delete user
                                    db.query(
                                        "DELETE FROM users WHERE id=?",
                                        [userId],
                                        (err) => {
                                            if (err) return res.status(500).json(err);

                                            res.json({
                                                message: "Player removed"
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

// BAN PLAYER
exports.banPlayer = (req, res) => {
    const userId = req.params.id;

    db.query(
        "UPDATE users SET is_banned=1 WHERE id=? AND role='player'",
        [userId],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Player not found or is admin"
                });
            }

            res.json({ message: "Player banned" });
        }
    );
};
// UNBAN PLAYER
exports.unbanPlayer = (req, res) => {
    const userId = req.params.id;

    db.query(
        "UPDATE users SET is_banned=0 WHERE id=?",
        [userId],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({ message: "Player unbanned" });
        }
    );
};
