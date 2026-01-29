const express = require("express");
const router = express.Router();
const { accessChat, fetchChats,searchUsers } = require("../controllers/chatController");
const { auth } = require("../middleware/auth"); // Assuming your JWT middleware is here

// Routes protected by JWT authentication
router.post("/access", auth, accessChat);
router.get("/fetch", auth, fetchChats);
router.get("/search", auth, searchUsers);

module.exports = router;