const db = require("../config/db");

exports.getStats = async (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      COUNT(*) AS gamesPlayed,
      MAX(score) AS bestScore,
      MIN(time_taken) AS bestTime,
      AVG(score) AS avgScore
    FROM games
    WHERE user_id = ?
      AND score IS NOT NULL
  `;

  try {
    const [result] = await db.query(sql, [userId]);
    res.json(result[0]);
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};