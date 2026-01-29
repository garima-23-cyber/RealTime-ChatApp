const mongoose = require('mongoose');

const contactListSchema = new mongoose.Schema({
    owner: {
        // The user whose contact/block list this document belongs to
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, // Ensures one list per user
    },
    blockedUsers: [
        {
            // Users that the 'owner' has blocked
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    contacts: [
        {
            // Users explicitly defined as friends/contacts
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    pendingRequests: [
        {
            // Users who have sent the 'owner' a friend request
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    
}, { timestamps: true });

module.exports = mongoose.model("ContactList", contactListSchema);