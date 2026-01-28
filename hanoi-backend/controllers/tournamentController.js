const db = require("../config/db");

// Get current tournament
exports.getTournament = (req, res) => {

    db.query(
        `
    SELECT *
    FROM tournaments
    WHERE status IN ('pending','active')
    ORDER BY id DESC
    LIMIT 1
    `,
        (err, result) => {

            if (err) return res.status(500).json(err);

            if (!result[0]) {
                return res.json(null);
            }

            res.json(result[0]);
        }
    );
};


// Start tournament
exports.startTournament = (req, res) => {

    const { name, start_time } = req.body;

    if (!name || !start_time) {
        return res.status(400).json({
            message: "Name and start time required"
        });
    }
    console.log("START TOURNAMENT:", name, start_time);

    db.query(
        `
    INSERT INTO tournaments
    (name, status, start_time, current_round)
    VALUES (?, 'pending', ?, 1)
    `,
        [name, new Date(start_time)],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            res.json({
                message: "Tournament scheduled",
                id: result.insertId
            });
        }
    );
};

// End tournament
exports.endTournament = (req, res) => {

    db.query(
        `
    UPDATE tournaments
    SET status = 'ended'
    WHERE status IN ('pending','active')
    `,
        (err, result) => {

            if (err) return res.status(500).json(err);

            res.json({
                message: "Tournament ended"
            });
        }
    );
};


// Save result
exports.saveResult = (req, res) => {
    const userId = req.user.id;
    const { score, time } = req.body;

    db.query(
        "SELECT * FROM tournaments WHERE status='active' LIMIT 1",
        (err, t) => {
            if (err) return res.status(500).json(err);

            if (!t.length)
                return res.status(400).json({ message: "No active tournament" });

            const tour = t[0];

            db.query(
                `INSERT INTO tournament_results
         (tournament_id, user_id, round, score, time_taken)
         VALUES (?, ?, ?, ?, ?)`,
                [tour.id, userId, tour.current_round, score, time],
                (err) => {
                    if (err) return res.status(500).json(err);

                    res.json({ message: "Result saved" });
                }
            );
        }
    );
};

// Next round
exports.nextRound = (req, res) => {
    db.query(
        "UPDATE tournaments SET current_round = current_round + 1 WHERE status='active'",
        (err) => {
            if (err) return res.status(500).json(err);

            res.json({ message: "Next round started" });
        }
    );
};

//Qualification block
exports.qualifyPlayers = (req, res) => {
    const limits = { 1: 20, 2: 5, 3: 1 };

    db.query(
        "SELECT * FROM tournaments WHERE status='active' LIMIT 1",
        (err, t) => {
            if (err) return res.status(500).json(err);

            if (!t.length)
                return res.status(400).json({ message: "No active tournament" });

            const tour = t[0];
            const round = tour.current_round;
            const limit = limits[round] || 1;

            db.query(
                `
        SELECT 
          user_id,
          MAX(score) AS score,
          MIN(time_taken) AS time
        FROM tournament_results
        WHERE tournament_id=? AND round=?
        GROUP BY user_id
        ORDER BY score DESC, time ASC
        LIMIT ?
        `,
                [tour.id, round, limit],
                (err, qualified) => {
                    if (err) return res.status(500).json(err);

                    if (!qualified.length) {
                        return res.json({ message: "No results yet" });
                    }

                    // Clear old qualifiers for this round
                    db.query(
                        "DELETE FROM tournament_qualifiers WHERE tournament_id=? AND round=?",
                        [tour.id, round]
                    );

                    // Insert new qualifiers
                    const values = qualified.map((q) => [
                        tour.id,
                        round,
                        q.user_id
                    ]);

                    db.query(
                        `
            INSERT INTO tournament_qualifiers
            (tournament_id, round, user_id)
            VALUES ?
            `,
                        [values],
                        (err) => {
                            if (err) return res.status(500).json(err);

                            res.json({
                                round,
                                qualified
                            });
                        }
                    );
                }
            );
        }
    );
};

exports.getBracket = (req, res) => {
    db.query(
        `
    SELECT 
      q.round,
      u.username,
      u.email
    FROM tournament_qualifiers q
    JOIN users u ON q.user_id = u.id
    JOIN tournaments t ON q.tournament_id = t.id
    WHERE t.status='active'
    ORDER BY q.round ASC
    `,
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json(result);
        }
    );
};
