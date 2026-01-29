import API from "./axios";

// Fetches all notifications (read and unread)
export const fetchNotifications = () => API.get("/notification/fetch");

// Marks a single notification (or all if notificationId is null) as read
export const markAsRead = (notificationId = null) => API.put("/notification/markasread", { notificationId });

// Deletes a specific notification
export const deleteNotification = (id) => API.delete(`/notification/delete/${id}`);