const db = require("../config/db");

// TOP PLAYERS
exports.getLeaderboard = async (req, res) => {
  const limit = 50;
  const sql = `
    SELECT 
      u.username,
      MAX(g.score) AS best_score,
      MIN(g.time_taken) AS best_time,
      MIN(g.moves) AS best_moves
    FROM users u
    JOIN games g ON u.id = g.user_id
    WHERE g.score IS NOT NULL
    GROUP BY u.id
    ORDER BY best_score DESC, best_time ASC
    LIMIT ?
  `;

  try {
    const [result] = await db.query(sql, [limit]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MY RANK
exports.getMyRank = async (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT rank FROM (
      SELECT 
        u.id,
        RANK() OVER (ORDER BY MAX(g.score) DESC) AS rank
      FROM users u
      JOIN games g ON u.id = g.user_id
      GROUP BY u.id
    ) ranks
    WHERE id = ?
  `;

  try {
    const [result] = await db.query(sql, [userId]);
    if (result.length === 0) return res.json({ rank: null });
    res.json({ rank: result[0].rank });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};