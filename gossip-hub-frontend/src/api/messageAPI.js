import API from "./axios";


export const fetchMessages = (chatId) => API.get(`/message/${chatId}`);


export const sendMessage = (content, chatId, messageType = "text") => 
    API.post("/message/send", { content, chatId, messageType });


export const searchMessages = (chatId, query) => 
    API.get(`/message/search/${chatId}?query=${query}`);


export const uploadMedia = (formData) => 
    API.post("/message/upload", formData);

export const deleteMessage = (messageId) => 
    API.delete(`/message/delete/${messageId}`);