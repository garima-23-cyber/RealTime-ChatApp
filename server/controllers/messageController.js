const Message = require("../models/Message");

const Chat = require("../models/Chat");
const { uploadImageToCloudinary } = require("../utils/imageUpload");
const cloudinary = require("cloudinary").v2;

/**
 * FETCH ALL MESSAGES
 * GET /api/v1/message/:chatId
 */
exports.allMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        // 1. Verify user membership in the chat
        const chat = await Chat.findOne({
            _id: chatId,
            users: { $elemMatch: { $eq: userId } },
        });

        if (!chat) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized: Access Denied." 
            });
        }

        // 2. Fetch and populate messages
        const messages = await Message.find({ chat: chatId })
            .populate("sender", "username image email") // ✅ Standardized 'image'
            .populate("chat")
            .sort({ createdAt: 1 }); // Ensure chronological order

        // ✅ FIX: Wrap in object with 'messages' key so frontend .map() works after refresh
        res.status(200).json({
            success: true,
            messages: messages 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * SEND MESSAGE (REST Fallback / Socket helper)
 * POST /api/v1/message/send
 */
exports.sendMessage = async (req, res) => {
    const sender = req.user.id;
    const { content, chatId, messageType, isGhostMode } = req.body;

    if (!content || !chatId) {
        return res.status(400).json({ 
            success: false, 
            message: "Content and Chat ID are required." 
        });
    }

    try {
        // 1. Create message with Ghost Mode support
        let message = await Message.create({
            sender: sender,
            content: content,
            chat: chatId,
            messageType: messageType || "text",
            isGhostMode: isGhostMode || false, // ✅ Persist ghost mode status
        });

        // 2. Populate for immediate UI response
        message = await Message.findById(message._id)
            .populate("sender", "username image email") // ✅ Consistently use 'image'
            .populate("chat");
        
        // 3. Update Chat reference
        await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

        return res.status(200).json({ success: true, message });

    } catch (error) {
        console.error("Error sending message:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to send message." 
        });
    }
};

/**
 * SEARCH MESSAGES
 */
exports.searchMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ success: false, message: "Query is required" });
        }

        const messages = await Message.find({
            chat: chatId,
            messageType: "text",
            content: { $regex: query, $options: "i" }
        }).populate("sender", "username image");

        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * UPLOAD MEDIA (Cloudinary Bridge)
 */
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || !req.files.media) {
      return res.status(400).json({ success: false, message: "No media file found" });
    }

    const file = req.files.media;

    // Use the specific utility
    const result = await uploadImageToCloudinary(
      file, 
      process.env.FOLDER_NAME || "Syncra_Media"
    );

    // ✅ Return detailed data for the UI renderer
    res.status(200).json({
      success: true,
      url: result.secure_url,
      duration: result.duration || 0,
      format: result.format,
      fileName: file.name
    });
  } catch (error) {
    console.error("Media Upload Error:", error);
    res.status(500).json({ success: false, message: "Media server unreachable" });
  }
};

// ... existing imports

/**
 * DELETE MESSAGE
 * DELETE /api/v1/message/delete/:messageId
 */
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        // 1. Find the message first to check ownership and media type
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // 2. Authorization check: Only the sender can delete the message
        if (message.sender.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this message" });
        }

        // 3. If it's a media message, delete from Cloudinary
        if (["image", "video", "voice"].includes(message.messageType)) {
            try {
                // Extract public_id from Cloudinary URL
                // Example: .../Syncra_Media/vibe_123.png -> Syncra_Media/vibe_123
                const publicId = message.content.split('/').slice(-2).join('/').split('.')[0];
                
                // Determine resource type (voice/video are 'video')
                const resourceType = message.messageType === "image" ? "image" : "video";
                
                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            } catch (clErr) {
                console.error("Cloudinary Cleanup Failed:", clErr);
                // We continue deleting from DB even if Cloudinary fails
            }
        }

        // 4. Remove from Database
        await Message.findByIdAndDelete(messageId);

        // 5. Update latestMessage in Chat if necessary
        const chat = await Chat.findById(message.chat);
        if (chat.latestMessage?.toString() === messageId) {
            const lastMsg = await Message.findOne({ chat: message.chat }).sort({ createdAt: -1 });
            chat.latestMessage = lastMsg ? lastMsg._id : null;
            await chat.save();
        }

        res.status(200).json({ success: true, message: "Message deleted successfully" });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: "Server error during deletion" });
    }
};