import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { useContact } from "./ContactContext"; // 🛰️ Import Contact Context
import { fetchNotifications, markAsRead } from "../api/notificationAPI";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { socket } = useSocket();
    const { user } = useAuth();
    const { refreshContacts } = useContact(); // 🔍 Pull refresh function

    useEffect(() => {
        if (user) {
            const loadNotifications = async () => {
                try {
                    const res = await fetchNotifications();
                    setNotifications(res.data.notifications || []);
                } catch (err) {
                    console.error("Syncra: Failed to load notifications", err);
                }
            };
            loadNotifications();
        } else {
            setNotifications([]);
        }
    }, [user]);

    useEffect(() => {
        if (socket) {
            console.log("🔔 Notification System: Linked to Socket");

            socket.on("receive_notification", (notification) => {
                setNotifications((prev) => [notification, ...prev]);
                
                // 🛠️ NEW LOGIC: If the notification is a friend request or acceptance,
                // we refresh the contacts so the Search Bar and Friend List update instantly.
                if (notification.type === "FRIEND_REQUEST" || notification.type === "FRIEND_ACCEPTED") {
                    refreshContacts();
                }

                toast.success(notification.content || "New notification received");
            });

            return () => {
                socket.off("receive_notification");
            };
        }
    }, [socket, refreshContacts]);

    const handleMarkAsRead = async (id = null) => {
        try {
            const payload = id ? { notificationId: id } : {};
            await markAsRead(payload);

            setNotifications((prev) =>
                prev.map((n) =>
                    (id === null || n._id === id) ? { ...n, isRead: true } : n
                )
            );

            // 🚀 If you just marked a "FRIEND_ACCEPTED" notification as read, 
            // it's a good time to sync contacts again.
            refreshContacts();

        } catch (err) {
            console.error("Syncra: UI Update failed", err);
        }
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount: notifications.filter(n => !n.isRead).length,
            handleMarkAsRead,
            setNotifications,
            refreshNotifications: () => {} // You could add a manual refresh if needed
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);