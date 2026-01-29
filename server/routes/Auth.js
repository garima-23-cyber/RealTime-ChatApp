// ./routes/Auth.js
const express = require("express");
const router = express.Router();
const {auth}=require("../middleware/auth");
const { login, signup, sendotp,verifyOtp, changePassword ,getMe} = require("../controllers/authController");

// Route for user login
router.post("/login", login);

// Route for user signup
router.post("/signup", signup);

// Route for verifying OTP (Creates the user and returns a token)
router.post("/verify-otp", verifyOtp);

// Route for sending OTP for verification
router.post("/sendotp", sendotp);

// Route for changing password (requires middleware for protection)
router.post("/changepassword", auth,changePassword);

router.get("/me", auth, getMe);

module.exports = router;