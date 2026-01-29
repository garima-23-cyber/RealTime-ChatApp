const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // --- Authentication ---
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },

    // --- Verification ---
    isVerified: {
      type: Boolean,
      default: false,
    },

    image: {
      type: String,
      default: "https://api.dicebear.com/5.x/initials/svg?seed=SyncraUser",
    },

    // LINK TO ADDITIONAL PROFILE DETAILS
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Profile", // This points to your Profile model
    },


    // --- Chat Status ---
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
