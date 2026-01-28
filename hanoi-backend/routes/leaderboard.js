const express = require("express");
const router = express.Router();

const {
  getLeaderboard,
  getMyRank
} = require("../controllers/leaderboardController");
const leaderboardController = require("../controllers/leaderboardController");
const auth = require("../middleware/auth");

router.get("/", leaderboardController.getLeaderboard);
router.get("/rank", auth, leaderboardController.getMyRank);

module.exports = router;
