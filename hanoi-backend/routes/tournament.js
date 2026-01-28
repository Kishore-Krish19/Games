const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Added checkEligibility to the list of imports below
const {
    getTournament,
    startTournament,
    endTournament,
    saveResult,
    nextRound,
    qualifyPlayers,
    getBracket,
    checkEligibility
} = require("../controllers/tournamentController");

router.post("/start", auth, admin, startTournament);
router.get("/", getTournament);
router.post("/end", auth, admin, endTournament);

router.post("/result", auth, saveResult);

router.post("/next", auth, admin, nextRound);
router.get("/qualify", auth, admin, qualifyPlayers);

// This will now work because the function is imported above
router.get("/check-eligibility", auth, checkEligibility);

router.get("/bracket", getBracket);

module.exports = router;