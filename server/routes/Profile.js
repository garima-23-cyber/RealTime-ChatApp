const express = require("express");
const router = express.Router();

// Import Middleware
const { auth } = require("../middleware/auth");

// Import Controllers
const {
    updateProfile,
    deleteAccount,
    getAllUserDetails,
    updateDisplayPicture,
    deleteDisplayPicture, // ✅ Added for the image purge feature
} = require("../controllers/profileController");

// ******************************************************************
//                      Profile Routes
// ******************************************************************

// 1. Delete User Account (Permanent Purge)
router.delete("/deleteProfile", auth, deleteAccount);

// 2. Update Profile Details (Bio, Gender, DOB, etc.)
router.put("/updateProfile", auth, updateProfile);

// 3. Fetch Full User Metadata
router.get("/getUserDetails", auth, getAllUserDetails);

// 4. Update Identity Image (Cloudinary Upload)
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

// 5. Remove Identity Image (Reset to Default)
router.delete("/deleteDisplayPicture", auth, deleteDisplayPicture);

module.exports = router;