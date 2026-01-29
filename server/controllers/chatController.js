const Chat = require("../models/Chat");
const User = require("../models/User");

// Helper function to create or fetch a 1-on-1 chat
// POST /api/v1/chat/access
exports.accessChat = async (req, res) => {
    // The user ID of the person the current user wants to chat with
    const { userId } = req.body; 

    // The ID of the currently logged-in user (from the JWT middleware)
    const currentUserId = req.user.id; 

    if (!userId) {
        return res.status(400).json({ success: false, message: "Recipient user ID not provided." });
    }

    try {
        // 1. Check if a chat already exists between these two users
        let isChat = await Chat.find({
            isGroupChat: false, // Must be a 1-on-1 chat
            $and: [
                { users: { $elemMatch: { $eq: currentUserId } } }, // User 1 is in the chat
                { users: { $elemMatch: { $eq: userId } } }, // User 2 is in the chat
            ],
        })
        .populate("users", "-password") // Populate user details, excluding password
        .populate("latestMessage"); // Populate the latest message details

        // 2. Further populate sender details within the latest message
        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "username avatar email",
        });

        if (isChat.length > 0) {
            // Chat found, return it
            return res.status(200).json({ success: true, chat: isChat[0] });
        } else {
            // 3. Chat not found, create a new one
            const chatData = {
                chatName: "sender", // Name will be determined on the frontend
                isGroupChat: false,
                users: [currentUserId, userId],
            };

            const createdChat = await Chat.create(chatData);

            // 4. Fetch the fully populated chat to return
            const fullChat = await Chat.findOne({ _id: createdChat._id })
                .populate("users", "-password");

            return res.status(200).json({ success: true, chat: fullChat });
        }
    } catch (error) {
        console.error("Error accessing chat:", error);
        return res.status(500).json({ success: false, message: "Error accessing or creating chat." });
    }
};

// GET /api/v1/chat/fetch
exports.fetchChats = async (req, res) => {
    // The ID of the currently logged-in user (from the JWT middleware)
    const currentUserId = req.user.id; 

    try {
        // 1. Find all chats where the current user is a participant
        let results = await Chat.find({ users: { $elemMatch: { $eq: currentUserId } } })
            .populate("users", "-password") // Populate user details
            .populate("groupAdmin", "-password") // Populate group admin details
            .populate({
                path: "latestMessage",
                populate: {
                    path: "sender",
                    select: "username avatar email"
                }
            })
            .sort({ updatedAt: -1 }); // Sort by most recently updated chat

        

        return res.status(200).json({ success: true,count:results.length, chats: results });

    } catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch user chats." });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        // Use query parameter 'username' from the URL
        const keyword = req.query.username
            ? {
                $or: [
                    { username: { $regex: req.query.username, $options: "i" } },
                    { email: { $regex: req.query.username, $options: "i" } },
                ],
              }
            : {};

        // Find users matching the keyword, excluding the current logged-in user
        const users = await User.find(keyword).find({ _id: { $ne: req.user.id } }).limit(10);
        
        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// NOTE: You would add controllers for group chat creation (createGroupChat) here later.