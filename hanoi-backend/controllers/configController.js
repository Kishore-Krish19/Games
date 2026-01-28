const db = require("../config/db");

// Get config (for players)
exports.getConfig = (req, res) => {
  db.query(
    "SELECT disk_count FROM game_config WHERE id=1",
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({ disks: result[0].disk_count });
    }
  );
};

// Update config (admin)
exports.updateConfig = (req, res) => {
  const { disks } = req.body;

  if (disks < 3 || disks > 7) {
    return res.status(400).json({
      message: "Disks must be between 3 and 7"
    });
  }

  db.query(
    "UPDATE game_config SET disk_count=? WHERE id=1",
    [disks],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Config updated ✅" });
    }
  );
};
