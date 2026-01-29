import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { fetchNotifications, markAsRead } from "../api/notificationAPI";
import { toast } from "react-toastify";
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const {socket} = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const loadNotifications = async () => {
                try {
                    const res = await fetchNotifications();
                    // Ensure we handle cases where notifications might be undefined
                    setNotifications(res.data.notifications || []);
                } catch (err) {
                    console.error("Syncra: Failed to load notifications", err);
                }
            };
            loadNotifications();
        } else {
            // Clear notifications on logout
            setNotifications([]);
        }
    }, [user]);

    useEffect(() => {
    // ✅ Guard: Only attach listeners if socket is defined
    if (socket) {
        console.log("🔔 Notification System: Linked to Socket");

        socket.on("receive_notification", (notification) => {
            // Your logic to handle new notifications
            setNotifications((prev) => [notification, ...prev]);
            toast.success(`New message from ${notification.sender.username}`);
        });

        return () => {
            socket.off("receive_notification");
        };
    }
}, [socket]);

    const handleMarkAsRead = async (id = null) => {
    try {
        // If id is null, we send an empty object (backend handles this as 'Mark All')
        // If id exists, we send the specific key the backend expects
        const payload = id ? { notificationId: id } : {};
        
        await markAsRead(payload);

        // Update UI state immediately
        setNotifications((prev) =>
            prev.map((n) => 
                (id === null || n._id === id) ? { ...n, isRead: true } : n
            )
        );
    } catch (err) {
        // This is where your console error was coming from
        console.error("Syncra: UI Update failed", err);
    }
  };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount: notifications.filter(n => !n.isRead).length,
            handleMarkAsRead,
            setNotifications // Useful if you want to delete notifications manually
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);