const express = require("express");
const router = express.Router();

// Import the controllers we discussed
const { startCallLog, updateCallStatus,getCallHistory } = require("../controllers/callController");

// Import your existing authentication middleware
const { auth } = require("../middleware/auth");

// Define the endpoints
// POST /api/v1/call/start
router.post("/start", auth, startCallLog);

// PUT /api/v1/call/update
router.put("/update", auth, updateCallStatus);

router.get("/history", auth, getCallHistory);

module.exports = router;