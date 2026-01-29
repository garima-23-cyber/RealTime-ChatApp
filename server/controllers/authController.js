const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();

// --- 1. SEND OTP ---
exports.sendotp = async (req, res) => {
    try {
        const { email } = req.body;

        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User is already registered",
            });
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // Ensure uniqueness
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator.generate(6, { upperCaseAlphabets: false });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };
        await OTP.create(otpPayload);

        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp, // Included for development testing
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// --- 2. SIGNUP (Now uses your project's Temp Storage logic) ---
// controllers/authController.js
exports.signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // 1. Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Generate and Store OTP
    // This triggers the pre-save email hook automatically
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await OTP.create({
      email,
      otp,
      tempUserData: { username, email, password: hashedPassword },
    });

    // 4. CRITICAL: Return success to the frontend
    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// --- 3. VERIFY OTP & CREATE USER ---
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the most recent OTP record for this email
        const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // Create the actual user from the temp data
        const user = await User.create({
            ...otpRecord.tempUserData,
            isVerified: true,
        });

        // Cleanup
        await OTP.deleteMany({ email });

        // Generate Token so they can enter the Chat Room immediately
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(201).json({
            success: true,
            token,
            user: { id: user._id, username: user.username, email: user.email },
            message: "Account verified and created successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Verification failed" });
    }
};

// --- 4. LOGIN ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Fill all fields" });
        }

        const user = await User.findOne({ email });
        if (!user || !user.isVerified) {
            return res.status(401).json({ success: false, message: "User not found or unverified" });
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { email: user.email, id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            user.password = undefined;
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Login Success",
            });
        } else {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Login Failure" });
    }
};

// --- 5. CHANGE PASSWORD ---
exports.changePassword = async (req, res) => {
    try {
        const userDetails = await User.findById(req.user.id);
        const { oldPassword, newPassword } = req.body;

        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Old password incorrect" });
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        // Send Email
        try {
            await mailSender(
                updatedUser.email,
                "Password Updated",
                passwordUpdated(updatedUser.email, `Password updated for ${updatedUser.username}`)
            );
        } catch (e) {
            console.error("Email error:", e.message);
        }

        return res.status(200).json({ success: true, message: "Password updated" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Update failed" });
    }
};
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};