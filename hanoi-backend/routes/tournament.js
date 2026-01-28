const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
    getTournament,
    startTournament,
    endTournament,
    saveResult
} = require("../controllers/tournamentController");

const { nextRound } = require("../controllers/tournamentController");
const { qualifyPlayers } = require("../controllers/tournamentController");
const { getBracket } = require("../controllers/tournamentController");



router.post("/start", auth, admin, startTournament);
router.get("/", getTournament);
router.post("/end", auth, admin, endTournament);

router.post("/result", auth, saveResult);

router.post("/next", auth, admin, nextRound);
router.get("/qualify", auth, admin, qualifyPlayers);
router.get("/bracket", getBracket);

module.exports = router;
