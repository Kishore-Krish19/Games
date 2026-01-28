const express = require("express");
const router = express.Router();

const {
  getLeaderboard,
  getMyRank
} = require("../controllers/leaderboardController");

const auth = require("../middleware/auth");

// Public leaderboard
router.get("/", getLeaderboard);

// User rank (protected)
router.get("/me", auth, getMyRank);

module.exports = router;
