import API from "./axios";

// Fetches friends, blocked users, and pending requests
export const fetchLists = () => API.get("/contacts/fetch");

// Sends a friend request to a specific user
export const sendFriendRequest = (recipientId) => API.post("/contacts/sendrequest", { recipientId });

// Accepts a pending friend request
export const acceptFriendRequest = (senderId) => API.post("/contacts/acceptrequest", { senderId });

// Blocks a user
export const blockUser = (userId) => API.post("/contacts/block", { userId: userId });
export const unblockUser = (userId) => API.post("/contacts/unblock", { userId: userId });