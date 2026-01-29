const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        // Now stores either text or the Cloudinary URL for media
        type: String,
        trim: true,
        required: true,
    },
    // NEW: Categorize the message so the frontend knows how to render it
    messageType: {
        type: String,
        enum: ["text", "image", "voice", "video", "file","call_log"],
        default: "text",
    },
    // NEW: Useful for searching/filtering files later
    fileDetails: {
        fileName: String,
        fileSize: String, // e.g., "2.4 MB"
        duration: Number, // For Voice/Video notes in seconds
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    readBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    // Keep Ghost Mode logic if you're using it
    isGhostMode: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// NEW: Add a text index to the content field to make SEARCH faster
messageSchema.index({ content: 'text' });

module.exports = mongoose.model("Message", messageSchema);