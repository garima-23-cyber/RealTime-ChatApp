import API from "./axios";

export const accessChat = (userId) => API.post("/chat/access", { userId });

export const fetchChats = () => API.get("/chat/fetch");

export const searchUsers = (query) => API.get(`/chat/search?username=${query}`);

