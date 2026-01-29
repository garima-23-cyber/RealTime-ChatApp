import React, { useState, useEffect, useRef } from "react";
import { fetchMessages } from "../../api/messageAPI";
import { blockUser, unblockUser } from "../../api/contactAPI"; 
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble"; 
import { toast } from "react-toastify"; // ✅ Switched to Toastify
import { IoMdCall, IoMdVideocam, IoMdPulse } from "react-icons/io";
import { FaGhost, FaUserSlash, FaUserCheck } from "react-icons/fa";

const MessageWindow = ({ chat }) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false); 
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [isSyncing, setIsSyncing] = useState(true);
    
    const { socket } = useSocket(); 
    const { user } = useAuth();
    const scrollRef = useRef();
    const chatIdRef = useRef(chat?._id);

    useEffect(() => {
        chatIdRef.current = chat?._id;
    }, [chat]);

    const currentUserId = user?.id || user?._id;
    const otherParticipant = chat?.users?.find((u) => (u?._id || u)?.toString() !== currentUserId?.toString());
    const targetUserId = (otherParticipant?._id || otherParticipant)?.toString();

    // 1. Historical Synchronization (Handshake)
    useEffect(() => {
        let isMounted = true;
        const syncHistory = async () => {
            if (!chat?._id) return;
            setIsSyncing(true);
            try {
                const res = await fetchMessages(chat._id);
                if (!isMounted) return;
                
                const msgData = res.data?.messages || res.data || [];
                setMessages(msgData);
                
                // Extract Ghost Protocol status from latest packet
                setIsGhostMode(msgData.length > 0 && msgData[msgData.length - 1].isGhostMode || false);
                setIsBlocked(res.data?.isBlocked || false); 
            } catch (err) { 
                toast.error("Handshake Interrupt: Data stream lost");
            } finally {
                setIsSyncing(false);
            }
        };
        syncHistory();
        return () => { isMounted = false; };
    }, [chat?._id]);

    // 2. Real-time Packet Orchestration (Socket Listeners)
    useEffect(() => {
        if (!socket || !chat?._id) return;
        socket.emit("join chat", chat._id);

        const handleReceiveMessage = (m) => {
            if ((m.chat?._id || m.chat)?.toString() === chatIdRef.current?.toString()) {
                setMessages(prev => prev.some(existing => existing._id === m._id) ? prev : [...prev, m]);
            }
        };

        const handleSentConfirm = ({ tempId, realMessage }) => {
            setMessages(prev => prev.map(m => m._id === tempId ? realMessage : m));
        };

        const handleBurn = (data) => {
            if (data.chatId?.toString() === chatIdRef.current?.toString()) {
                setMessages(prev => prev.filter(m => m._id !== data.messageId));
            }
        };

        const handleVibe = (data) => {
            if (data.chatId?.toString() === chatIdRef.current?.toString()) setIsGhostMode(data.isGhostMode);
        };

        const handleTyping = (id) => id?.toString() === chatIdRef.current?.toString() && setIsTyping(true);
        const handleStopTyping = (id) => id?.toString() === chatIdRef.current?.toString() && setIsTyping(false);

        socket.on("receive message", handleReceiveMessage);
        socket.on("message_sent_confirm", handleSentConfirm);
        socket.on("message_burn", handleBurn);
        socket.on("vibe_updated", handleVibe);
        socket.on("typing", handleTyping);
        socket.on("stop typing", handleStopTyping);

        return () => {
            socket.off("receive message");
            socket.off("message_sent_confirm");
            socket.off("message_burn");
            socket.off("vibe_updated");
            socket.off("typing");
            socket.off("stop typing");
        };
    }, [socket, chat._id]);

    // 3. Smooth Auto-scroll (Perspective Corrected)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages, isTyping]);

    const handleCall = (type) => {
        if (isBlocked) return toast.warning("Signal Blocked by Firewall");
        if (window.initiateSyncraCall) {
            window.initiateSyncraCall(targetUserId, otherParticipant?.username || "Secure User", type, chat._id);
        } else {
            toast.error("HARDWARE_ERROR: Comms Module Offline");
        }
    };

    const toggleGhostMode = () => {
        const newMode = !isGhostMode;
        setIsGhostMode(newMode);
        socket?.emit("vibe_change", { chatId: chat._id, isGhostMode: newMode });
        toast.info(newMode ? "GHOST_PROTOCOL_ENGAGED" : "STANDARD_MODE_RESTORED");
    };

    return (
        <div className={`flex flex-col h-full font-inter relative transition-all duration-1000 overflow-hidden perspective-1000 ${isGhostMode ? "bg-black/95" : "bg-transparent"}`}>
            
            {/* 🎞️ Static Scanline Overlay */}
            <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none z-40" />

            {/* 🛡️ HUD Header: Tactical Control Plane */}
            <div className={`px-8 py-5 border-b z-30 transition-all duration-500 backdrop-blur-3xl rim-light shadow-glass-sm ${isGhostMode ? "bg-black/60 border-syncra-pink/30" : "bg-white/[0.02] border-white/5"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="text-white font-black tracking-tighter text-xl uppercase italic group-hover:text-syncra-pink transition-colors">
                            {chat.isGroupChat ? (chat.chatName || "Syncra_Cluster") : (otherParticipant?.username || "Secure_Node")}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center justify-center">
                                <div className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-syncra-pink animate-ping' : 'bg-green-500 shadow-neon-pink'}`} />
                            </div>
                            <span className={`text-[8px] font-mono uppercase tracking-[0.4em] font-black transition-all ${isGhostMode ? "text-syncra-pink" : "text-zinc-600"}`}>
                                {isGhostMode ? "IDENTITY_MASKING_ACTIVE" : isBlocked ? "NODE_DISCONNECTED" : isTyping ? "INCOMING_DATA_STREAM..." : "P2P_LINK_STABLE"}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {!chat.isGroupChat && (
                            <div className="flex items-center bg-white/[0.03] rounded-2xl p-1 border border-white/5 shadow-inner">
                                <button onClick={() => handleCall("voice")} className="p-3 text-zinc-500 hover:text-syncra-pink hover:bg-white/5 rounded-xl transition-all active:scale-90"><IoMdCall size={18} /></button>
                                <button onClick={() => handleCall("video")} className="p-3 text-zinc-500 hover:text-syncra-pink hover:bg-white/5 rounded-xl transition-all active:scale-90"><IoMdVideocam size={18} /></button>
                            </div>
                        )}
                        <div className="w-[1px] h-6 bg-white/5 mx-1" />
                        <button onClick={toggleGhostMode} className={`p-3.5 rounded-xl border preserve-3d transition-all duration-500 ${isGhostMode ? "border-syncra-pink bg-syncra-pink/20 text-syncra-pink shadow-neon-pink scale-110" : "border-white/5 bg-white/5 text-zinc-600 hover:border-syncra-pink/50 hover:text-syncra-pink"}`}><FaGhost /></button>
                        <button 
                            onClick={async () => {
                                try {
                                    isBlocked ? await unblockUser(targetUserId) : await blockUser(targetUserId);
                                    setIsBlocked(!isBlocked);
                                    toast.success(`MATRIX_CONFIG_UPDATED`);
                                } catch (err) { toast.error("Handshake_Retry_Failed"); }
                            }} 
                            className={`p-3.5 rounded-xl border transition-all duration-500 ${isBlocked ? "text-green-500 bg-green-500/10 border-green-500/20" : "text-red-500/20 border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-zinc-600 hover:text-red-500"}`}
                        >
                            {isBlocked ? <FaUserCheck /> : <FaUserSlash />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 🎞️ Message Corridor: 3D Scroll Depth */}
            <div className={`flex-1 overflow-y-auto px-8 py-12 flex flex-col gap-10 custom-scrollbar relative z-10 transition-opacity duration-700 ${isBlocked ? 'opacity-10 grayscale pointer-events-none' : ''} ${isSyncing ? 'opacity-0' : 'opacity-100'}`}>
                {messages.map((m) => (
                    <div key={m._id} className="animate-in fade-in slide-in-from-bottom-6 duration-700 preserve-3d">
                        <MessageBubble message={m} currentUserId={currentUserId} />
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.02] border border-white/5 rounded-3xl w-fit animate-in fade-in slide-in-from-left-6 duration-500 backdrop-blur-xl rim-light shadow-glass-sm">
                        <div className="flex gap-2">
                            <span className="w-1.5 h-1.5 bg-syncra-pink rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-syncra-pink rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-syncra-pink rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.4em] italic">Bitstream_Incoming</span>
                    </div>
                )}
                <div ref={scrollRef} className="h-4 w-full" />
            </div>

            {/* 📟 Handshake Loader (Initial Sync) */}
            {isSyncing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-[#050505] z-50">
                    <div className="relative">
                        <div className="absolute inset-0 bg-syncra-pink/20 blur-[40px] rounded-full animate-ping" />
                        <IoMdPulse className="text-syncra-pink text-6xl relative z-10 animate-pulse" />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.8em] font-black text-white/40 animate-pulse">Syncing_Historical_Packets</p>
                        <div className="w-48 h-[1px] bg-white/5 mx-auto mt-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-syncra-pink w-1/2 animate-slide-infinite" />
                        </div>
                    </div>
                </div>
            )}

            {/* ⌨️ Input Dock: Bottom Glass Plane */}
            <div className="relative z-30 p-8 bg-gradient-to-t from-black/60 to-transparent">
                <div className="transform-gpu hover:scale-[1.002] transition-transform duration-700">
                    <MessageInput 
                        chatId={chat._id} 
                        setMessages={setMessages} 
                        isBlocked={isBlocked} 
                        isGhostMode={isGhostMode} 
                    />
                </div>
            </div>
        </div>
    );
};

export default MessageWindow;