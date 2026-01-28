const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  startGame,
  endGame
} = require("../controllers/gameController");

// Protected routes
router.post("/start", auth, startGame);
router.post("/end", auth, endGame);

module.exports = router;
