const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth"); 
const { fetchNotifications, markAsRead, deleteNotification } = require("../controllers/notificationController");

// All notification routes require authentication
router.get("/fetch", auth, fetchNotifications);
router.put("/markasread", auth, markAsRead);
router.delete("/delete/:notificationId", auth, deleteNotification);

module.exports = router;