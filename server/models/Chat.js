const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    // --- Basic Conversation Info ---
    isGroupChat: {
        // Distinguishes between one-on-one chats and group chats
        type: Boolean,
        default: false,
    },
    chatName: {
        // Name of the group, or null for one-on-one chats
        type: String,
        trim: true,
    },

    // --- Participants ---
    users: [
        {
            // Array of references to the User model
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    // --- Message Tracking ---
    latestMessage: {
        // Reference to the most recent message in the chat
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },

    // --- Group Chat Specific Fields (Optional) ---
    groupAdmin: {
        // Reference to the user who created/manages the group
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function() { return this.isGroupChat; } // Only required if it's a group chat
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
    
}, { timestamps: true }); // Adds createdAt and updatedAt fields

module.exports = mongoose.model("Chat", chatSchema);