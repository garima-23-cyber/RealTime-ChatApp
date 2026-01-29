const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        // The user who needs to see this notification
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sender: {
        // The user who triggered the event (e.g., sent the message or invite)
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        // A brief, displayable text summary of the notification
        type: String,
        required: true,
        trim: true,
    },
    type: {
        // Category of the notification (e.g., 'NEW_MESSAGE', 'GROUP_INVITE', 'FRIEND_REQUEST')
        type: String,
        enum: [
            'NEW_MESSAGE', 
            'GROUP_INVITE', 
            'FRIEND_REQUEST',
            'FRIEND_ACCEPTED', 
            'SYSTEM'
        ],
        default: 'NEW_MESSAGE',
    },
    isRead: {
        // Flag to track if the recipient has viewed the notification
        type: Boolean,
        default: false,
    },
    relatedChat: {
        // Reference to the chat or message that triggered the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    },
    
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);