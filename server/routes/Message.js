const express = require("express");
const router = express.Router();
const { allMessages, sendMessage,searchMessages ,uploadMedia,deleteMessage} = require("../controllers/messageController");
const { auth } = require("../middleware/auth"); // Assuming your JWT middleware is here

// Route to fetch all messages for a specific chat ID
router.get("/:chatId", auth, allMessages);

router.get("/search/:chatId", auth, searchMessages);

router.post("/upload", auth, uploadMedia);

// Route for sending a new message (used mainly by the server-side Socket.IO)
// NOTE: This REST endpoint is typically used as a backup or for testing,
// as real-time sending relies on the socket event.
router.post("/send", auth, sendMessage); 
router.delete("/delete/:messageId", auth, deleteMessage);

module.exports = router;