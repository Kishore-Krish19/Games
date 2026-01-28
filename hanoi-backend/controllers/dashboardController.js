const db = require("../config/db");

exports.getStats = (req, res) => {
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

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result[0]);
  });
};
