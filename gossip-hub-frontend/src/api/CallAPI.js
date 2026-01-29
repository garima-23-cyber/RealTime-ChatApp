import API from "./axios";


export const fetchCallHistory = () => API.get("/call/history");

/**
 
 * @param {Array} participants - [senderId, receiverId]
 * @param {String} chat - Chat ID
 * @param {String} callType - "voice" or "video"
 */
export const startCallLog = (data) => API.post("/call/start", data);

/**
 
 * @param {String} callId - The ID returned from startCallLog
 * @param {String} status - "completed" or "rejected"
 * @param {Number} duration - Duration in seconds
 */
export const updateCallLog = (data) => API.put("/call/update", data);

