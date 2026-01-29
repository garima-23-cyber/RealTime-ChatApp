const CallLog = require("../models/CallLog");

exports.startCallLog = async (req, res) => {
  try {
    const { participants, chat, callType } = req.body;
    
    const newCall = await CallLog.create({
      participants,
      chat,
      callType,
      status: "missed", // Default until accepted
    });

    res.status(200).json({ success: true, callId: newCall._id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error starting call log" });
  }
};

exports.updateCallStatus = async (req, res) => {
  try {
    const { callId, status, duration } = req.body;

    const updatedCall = await CallLog.findByIdAndUpdate(
      callId,
      { status, duration, startTime: Date.now() },
      { new: true }
    );

    res.status(200).json({ success: true, updatedCall });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating call log" });
  }
};

exports.getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Find logs where the user is one of the participants
    const logs = await CallLog.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "username image email") // Get details of users
      .populate("chat", "chatName isGroupChat")
      .sort({ startTime: -1 }) // Newest first
      .limit(20);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not retrieve call history",
    });
  }
};