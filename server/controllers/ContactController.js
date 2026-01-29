const ContactList = require("../models/ContactList");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Helper function to ensure the ContactList document exists for the user
const ensureContactList = async (userId) => {
    let list = await ContactList.findOne({ owner: userId });
    if (!list) {
        list = await ContactList.create({ owner: userId });
    }
    return list;
};

// GET /api/v1/contacts/fetch
// Fetches the entire contact list and block list for the logged-in user.
exports.fetchLists = async (req, res) => {
    const ownerId = req.user.id;

    try {
        const list = await ContactList.findOne({ owner: ownerId })
            .populate("blockedUsers", "username avatar email")
            .populate("contacts", "username avatar email")
            .populate("pendingRequests", "username avatar email");

        if (!list) {
            // Create and return an empty list if none exists
            const newList = await ensureContactList(ownerId);
            return res.status(200).json({ success: true, list: newList });
        }

        return res.status(200).json({ success: true, list });

    } catch (error) {
        console.error("Error fetching contact lists:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to fetch contact lists.", 
            error: error.message 
        });
    }
};

// POST /api/v1/contacts/sendrequest (MODIFIED)
// Sends a friend request from the logged-in user to another user.
exports.sendFriendRequest = async (req, res) => {
    const senderId = req.user.id;
    const { recipientId } = req.body;

    if (!recipientId) {
        return res.status(400).json({ success: false, message: "Recipient ID required." });
    }

    try {
        const senderList = await ensureContactList(senderId);
        const recipientList = await ensureContactList(recipientId);
        
        // 1. Check if already friends or blocked
        if (senderList.contacts.includes(recipientId) || senderList.blockedUsers.includes(recipientId)) {
            return res.status(400).json({ success: false, message: "Cannot send request: User is already a contact or is blocked." });
        }
        
        // 2. Add sender ID to recipient's pendingRequests list
        if (!recipientList.pendingRequests.includes(senderId)) {
            recipientList.pendingRequests.push(senderId);
            await recipientList.save();
            
            // 🔥 NEW LOGIC: CREATE NOTIFICATION FOR THE RECIPIENT
            const senderUser = await User.findById(senderId);
            
            await Notification.create({
                recipient: recipientId,
                sender: senderId,
                content: `You received a friend request from ${senderUser.username}.`,
                type: "FRIEND_REQUEST",
                // relatedChat is null for friend requests
            });
            // -----------------------------------------------------------------
            
            return res.status(200).json({ success: true, message: "Friend request sent successfully." });
        } else {
            return res.status(400).json({ success: false, message: "Friend request already pending." });
        }

    } catch (error) {
        console.error("Error sending friend request:", error.message);
        return res.status(500).json({ success: false, message: "Failed to send friend request." });
    }
};

// POST /api/v1/contacts/acceptrequest (MODIFIED)
// Accepts a friend request from another user.
exports.acceptFriendRequest = async (req, res) => {
    const currentUserId = req.user.id;
    const { senderId } = req.body;

    try {
        // 1. Get contact lists for both users
        const currentUserList = await ensureContactList(currentUserId);
        const senderList = await ensureContactList(senderId);

        // 2. Remove sender from current user's pending requests
        const index = currentUserList.pendingRequests.indexOf(senderId);
        if (index > -1) {
            currentUserList.pendingRequests.splice(index, 1);
        } else {
            return res.status(404).json({ success: false, message: "No pending request from this sender." });
        }
        
        // 3. Add both users to each other's contact lists
        if (!currentUserList.contacts.includes(senderId)) {
            currentUserList.contacts.push(senderId);
        }
        if (!senderList.contacts.includes(currentUserId)) {
            senderList.contacts.push(currentUserId);
        }

        await currentUserList.save();
        await senderList.save();
        
        // 🔥 NEW LOGIC: CREATE NOTIFICATION FOR THE ORIGINAL SENDER
        const acceptorUser = await User.findById(currentUserId);
        
        await Notification.create({
            recipient: senderId, // The original sender is the recipient of this notification
            sender: currentUserId,
            content: `${acceptorUser.username} accepted your friend request.`,
            type: "FRIEND_ACCEPTED",
        });
        // -----------------------------------------------------------------

        return res.status(200).json({ success: true, message: "Friend request accepted! You are now connected." });
    } catch (error) {
        console.error("Error accepting request:", error.message);
        return res.status(500).json({ success: false, message: "Failed to accept friend request." });
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const { userId } = req.body; 
        const currentUserId = req.user.id;

        if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

        const ownerList = await ContactList.findOne({ owner: currentUserId });
        if (!ownerList) return res.status(404).json({ success: false, message: "List not found" });

        // Remove ID from array
        ownerList.blockedUsers = ownerList.blockedUsers.filter(id => id.toString() !== userId);

        await ownerList.save();
        res.status(200).json({ success: true, message: "User unblocked" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.blockUser = async (req, res) => {
    try {
        const userIdToBlock = req.body.userIdToBlock || req.body.userId;
        const currentUserId = req.user.id;

        const ownerList = await ensureContactList(currentUserId);
        
        // Remove from other lists first
        ownerList.contacts = ownerList.contacts.filter(id => id.toString() !== userIdToBlock);
        ownerList.pendingRequests = ownerList.pendingRequests.filter(id => id.toString() !== userIdToBlock);

        if (!ownerList.blockedUsers.includes(userIdToBlock)) {
            ownerList.blockedUsers.push(userIdToBlock);
        }

        await ownerList.save();
        res.status(200).json({ success: true, message: "User blocked" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};