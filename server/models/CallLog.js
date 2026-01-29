const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  callType: { type: String, enum: ["voice", "video"] },
  status: { type: String, enum: ["missed", "completed", "rejected"] },
  duration: { type: Number, default: 0 }, // in seconds
  startTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CallLog", callLogSchema);