const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth"); 
const { fetchLists, sendFriendRequest, acceptFriendRequest, blockUser,unblockUser } = require("../controllers/ContactController");

// All contact routes require authentication
router.get("/fetch", auth, fetchLists);
router.post("/sendrequest", auth, sendFriendRequest);
router.post("/acceptrequest", auth, acceptFriendRequest);
router.post("/block", auth, blockUser);
router.post("/unblock",auth, unblockUser);

module.exports = router;