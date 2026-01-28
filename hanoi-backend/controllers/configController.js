const db = require("../config/db");

// Get config (for players)
exports.getConfig = async (req, res) => {
  try {
    const [result] = await db.query("SELECT disk_count FROM game_config WHERE id=1");
    if (result.length === 0) return res.status(404).json({ message: "Config not found" });

    res.json({ disks: result[0].disk_count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update config (admin)
exports.updateConfig = async (req, res) => {
  const { disks } = req.body;

  if (disks < 3 || disks > 7) {
    return res.status(400).json({
      message: "Disks must be between 3 and 7"
    });
  }

  try {
    await db.query(
      "UPDATE game_config SET disk_count=? WHERE id=1",
      [disks]
    );
    res.json({ message: "Config updated ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};