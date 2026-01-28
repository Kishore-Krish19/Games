const db = require("../config/db");

// Get current tournament
exports.getTournament = async (req, res) => {
    try {
        const [result] = await db.query(
            `SELECT * FROM tournaments WHERE status IN ('pending','active') ORDER BY id DESC LIMIT 1`
        );
        if (!result[0]) return res.json(null);

        const tour = result[0];
        const now = new Date();
        const scheduledStart = new Date(tour.start_time);

        if (tour.status === 'pending' && now >= scheduledStart) {
            await db.query(
                `UPDATE tournaments SET status = 'active', start_time = ? WHERE id = ?`,
                [now, tour.id]
            );
            tour.status = 'active';
            tour.start_time = now;
        }
        res.json(tour);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Start tournament
exports.startTournament = async (req, res) => {
    const { name, start_time } = req.body;
    if (!name || !start_time) return res.status(400).json({ message: "Name and start time required" });

    try {
        const [result] = await db.query(
            `INSERT INTO tournaments (name, status, start_time, current_round) VALUES (?, 'pending', ?, 1)`,
            [name, new Date(start_time)]
        );
        res.json({ message: "Tournament scheduled", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// End tournament
exports.endTournament = async (req, res) => {
    try {
        await db.query(`UPDATE tournaments SET status = 'ended' WHERE status IN ('pending','active')`);
        res.json({ message: "Tournament ended" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Next Round
exports.nextRound = async (req, res) => {
    try {
        const now = new Date();
        await db.query(
            "UPDATE tournaments SET current_round = current_round + 1, start_time = ? WHERE status='active'",
            [now]
        );
        res.json({ message: "Next round started with fresh timer" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Qualify Players
exports.qualifyPlayers = async (req, res) => {
    const limits = { 1: 20, 2: 5, 3: 1 };
    try {
        const [t] = await db.query("SELECT * FROM tournaments WHERE status='active' LIMIT 1");
        if (!t.length) return res.status(400).json({ message: "No active tournament" });

        const tour = t[0];
        const round = tour.current_round;
        const limit = limits[round] || 1;

        const [qualified] = await db.query(
            `SELECT user_id, MAX(score) AS score, MIN(time_taken) AS time
             FROM tournament_results WHERE tournament_id=? AND round=?
             GROUP BY user_id ORDER BY score DESC, time ASC LIMIT ?`,
            [tour.id, round, limit]
        );

        if (!qualified.length) return res.json({ message: "No results yet", qualified: [] });

        await db.query("DELETE FROM tournament_qualifiers WHERE tournament_id=? AND round=?", [tour.id, round]);
        const values = qualified.map((q) => [tour.id, round, q.user_id]);
        
        // Use standard query for bulk insert
        await db.query("INSERT INTO tournament_qualifiers (tournament_id, round, user_id) VALUES ?", [values]);

        res.json({ message: "Players Qualified", qualified });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Bracket
exports.getBracket = async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT q.round, u.username FROM tournament_qualifiers q
            JOIN users u ON q.user_id = u.id ORDER BY q.round ASC
        `);
        res.json(result);
    } catch (err) {
        res.status(500).json([]);
    }
};

// Save tournament result
exports.saveResult = async (req, res) => {
    const userId = req.user.id;
    const { score, time_taken } = req.body;

    try {
        const [t] = await db.query("SELECT * FROM tournaments WHERE status='active' LIMIT 1");
        if (!t.length) return res.status(400).json({ message: "No active tournament" });

        const tour = t[0];
        await db.query(
            `INSERT INTO tournament_results (tournament_id, user_id, round, score, time_taken) VALUES (?, ?, ?, ?, ?)`,
            [tour.id, userId, tour.current_round, score, time_taken]
        );

        res.json({ message: "Tournament result saved ✅" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check Eligibility
exports.checkEligibility = async (req, res) => {
    try {
        const userId = req.user.id;
        const [t] = await db.query("SELECT id, current_round FROM tournaments WHERE status='active' LIMIT 1");

        if (!t.length) return res.json({ eligible: true });

        const tour = t[0];
        if (tour.current_round === 1) return res.json({ eligible: true });

        const [qualified] = await db.query(
            "SELECT id FROM tournament_qualifiers WHERE tournament_id=? AND round=? AND user_id=?",
            [tour.id, tour.current_round - 1, userId]
        );

        res.json({ eligible: qualified.length > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};