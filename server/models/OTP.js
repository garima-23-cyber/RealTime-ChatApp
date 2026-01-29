const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerfication");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },

  // 🔥 TEMP STORAGE FOR SIGNUP DATA
  tempUserData: {
    username: String,
    email: String,
    password: String, // already hashed
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // auto-delete after 5 minutes
  },
});

// ---- SEND EMAIL ----
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from Gossip Hub",
      emailTemplate(otp)
    );
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Mail error:", error);
    throw error;
  }
}

// ---- PRE-SAVE HOOK ----
OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  // next();
});

module.exports = mongoose.model("OTP", OTPSchema);
