const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getPlayers
} = require("../controllers/adminController");
const { deletePlayer } = require("../controllers/adminController");
const { banPlayer, unbanPlayer } = require("../controllers/adminController");
const { clearTournamentData,clearAllTournaments } = require("../controllers/adminController");

router.get("/players", auth, admin, getPlayers);
router.delete("/player/:id", auth, admin, deletePlayer);
router.post("/ban/:id", auth, admin, banPlayer);
router.post("/unban/:id", auth, admin, unbanPlayer);
router.post("/clear-data", auth, admin, clearTournamentData);
router.post("/clear-tournaments", auth, admin, clearAllTournaments);

module.exports = router;
