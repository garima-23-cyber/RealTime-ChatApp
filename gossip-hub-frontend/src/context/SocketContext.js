import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, token } = useAuth(); // Assuming token is also in AuthContext

    useEffect(() => {
        // Use either the passed token or localStorage
        const authToken = token || localStorage.getItem("token");

        if (user && authToken) {
            const newSocket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:4000", {
                auth: { token: authToken },
                reconnection: true,
                reconnectionAttempts: 5,
                transports: ["websocket","polling"] // Force websocket for faster "Link"
            });

            newSocket.on("connect", () => {
                console.log("✅ Syncra Link Established:", newSocket.id);
                setSocket(newSocket);
            });

            newSocket.on("connect_error", (err) => {
                console.error("❌ Socket Connection Error:", err.message);
                setSocket(null);
            });

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        } else {
            // Cleanup socket if user logs out
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user, token]);

    // ✅ FIX: Pass as an object so destructuring { socket } works
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};