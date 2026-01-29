const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUpload");

// 1. UPDATE PROFILE & USER DETAILS
exports.updateProfile = async (req, res) => {
    try {
        const { gender, dateOfBirth, about = "", contactNumber, username } = req.body;
        const userId = req.user.id;

        // Find user and update profile in one flow
        const userDetails = await User.findById(userId);
        if (!userDetails) return res.status(404).json({ success: false, message: "User not found" });

        // Update Profile
        await Profile.findByIdAndUpdate(
            userDetails.additionalDetails,
            { gender, dateOfBirth, about, contactNumber },
            { new: true }
        );

        // Update User (Username)
        const userUpdateData = {};
        if (username) userUpdateData.username = username;

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            userUpdateData, 
            { new: true }
        ).populate("additionalDetails").exec();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. GET ALL USER DETAILS
exports.getAllUserDetails = async (req, res) => {
    try {
        const userDetails = await User.findById(req.user.id)
            .populate("additionalDetails")
            .exec();

        if (!userDetails) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({
            success: true,
            data: userDetails,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. UPDATE DISPLAY PICTURE
exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        const updatedProfile = await User.findByIdAndUpdate(
            userId,
            { image: image.secure_url },
            { new: true }
        ).populate("additionalDetails");

        return res.status(200).json({
            success: true,
            message: "Image updated successfully",
            data: updatedProfile,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. DELETE DISPLAY PICTURE (Reset to default)
exports.deleteDisplayPicture = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Use an initial avatar generator as the "deleted" fallback
        const user = await User.findById(userId);
        const defaultImage = `https://ui-avatars.com/api/?name=${user.username}&background=0D1117&color=fff`;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { image: defaultImage },
            { new: true }
        ).populate("additionalDetails");

        return res.status(200).json({
            success: true,
            message: "Display picture removed",
            data: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. DELETE ACCOUNT
exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Delete Associated Profile and User
        await Profile.findByIdAndDelete(user.additionalDetails);
        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Account purged from system",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Could not delete user" });
    }
};