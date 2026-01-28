const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const {
  getConfig,
  updateConfig
} = require("../controllers/configController");

// Public (players)
router.get("/", getConfig);

// Admin only (for now protected)
router.post("/", auth, admin, updateConfig);

module.exports = router;
