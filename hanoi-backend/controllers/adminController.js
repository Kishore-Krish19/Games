const db = require("../config/db");

// GET PLAYERS
exports.getPlayers = async (req, res) => {
    const sql = `
    SELECT u.id, u.username, u.role, u.is_banned,
    COUNT(g.id) AS games, MAX(g.score) AS bestScore
    FROM users u LEFT JOIN games g ON u.id = g.user_id
    WHERE u.role = 'player' GROUP BY u.id ORDER BY bestScore DESC`;
    try {
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE PLAYER
exports.deletePlayer = async (req, res) => {
    const userId = req.params.id;
    try {
        const [user] = await db.query("SELECT role FROM users WHERE id=?", [userId]);
        if (!user.length) return res.status(404).json({ message: "User not found" });
        if (user[0].role === "admin") return res.status(403).json({ message: "Cannot delete admin" });

        await db.query("DELETE FROM games WHERE user_id=?", [userId]);
        await db.query("DELETE FROM tournament_results WHERE user_id=?", [userId]);
        await db.query("DELETE FROM tournament_qualifiers WHERE user_id=?", [userId]);
        await db.query("DELETE FROM users WHERE id=?", [userId]);

        res.json({ message: "Player removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// BAN PLAYER
exports.banPlayer = async (req, res) => {
    try {
        const [result] = await db.query("UPDATE users SET is_banned=1 WHERE id=? AND role='player'", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Not found or admin" });
        res.json({ message: "Player banned" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UNBAN PLAYER
exports.unbanPlayer = async (req, res) => {
    try {
        await db.query("UPDATE users SET is_banned=0 WHERE id=?", [req.params.id]);
        res.json({ message: "Player unbanned" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CLEAR TOURNAMENT DATA
exports.clearTournamentData = async (req, res) => {
    try {
        await db.query("DELETE FROM tournament_results");
        await db.query("DELETE FROM tournament_qualifiers");
        await db.query("DELETE FROM games");
        res.json({ message: "Leaderboard and Brackets cleared successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CLEAR ALL TOURNAMENTS
exports.clearAllTournaments = async (req, res) => {
    try {
        // This clears the main tournament configuration/history
        await db.query("DELETE FROM tournaments");
        res.json({ message: "All tournament records cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};