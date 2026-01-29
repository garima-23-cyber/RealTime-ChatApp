import React, { useState } from "react";
import MediaRenderer from "./MediaRender";
import CallLogBubble from "./CallLogBubble";
import { useSocket } from "../../context/SocketContext";
import { deleteMessage } from "../../api/messageAPI";
import { IoMdTrash } from "react-icons/io";
import { RiGhostFill } from "react-icons/ri"; 
import { toast } from "react-toastify"; // ✅ Switched to Toastify

const MessageBubble = ({ message, currentUserId }) => {
    const { socket } = useSocket();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    if (message.messageType === "call_log") {
        return <CallLogBubble message={message} />;
    }

    const senderId = message.sender?._id || message.sender;
    const isOwnMessage = senderId?.toString() === currentUserId?.toString();
    const activeGhost = message.isGhostMode;
    const displayContent = message.content || "";

    // 🚮 Handle Matrix Purge (Deletion)
    const handleDelete = async () => {
        if (!window.confirm("Purge this transmission from the matrix?")) return;
        
        setIsDeleting(true);
        const purgePromise = deleteMessage(message._id);

        toast.promise(purgePromise, {
            pending: 'Executing Purge Protocol...',
            success: 'Transmission Neutralized ⚡',
            error: 'CRITICAL_ERROR: Purge Interrupted',
        });

        try {
            await purgePromise;
            setIsVisible(false);
            socket?.emit("delete_message", { 
                messageId: message._id, 
                chatId: message.chat?._id || message.chat 
            });
        } catch (err) {
            setIsDeleting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`group flex flex-col ${isOwnMessage ? "items-end" : "items-start"} w-full perspective-1000 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            
            <div className={`flex items-center gap-3 max-w-[85%] preserve-3d transition-all duration-500 hover:translate-z-10 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* 🛡️ The 3D Glass Node (The Bubble) */}
                <div className={`px-6 py-3.5 rounded-[2rem] text-[13px] relative transition-all duration-1000 glass-3d shadow-glass-surface ${
                    isDeleting ? "opacity-0 scale-50 blur-3xl translate-y-20" : "opacity-100 scale-100"
                } ${
                    isOwnMessage 
                    ? `rounded-tr-none ${activeGhost ? "bg-syncra-pink/20 border-syncra-pink/50 shadow-neon-pink" : "bg-gradient-to-br from-syncra-pink to-[#D4145A] border-white/20"}` 
                    : `rounded-tl-none ${activeGhost ? "bg-black/80 border-syncra-pink/30 shadow-glass-sm" : "bg-white/[0.03] border-white/10"} rim-light`
                }`}>
                    
                    {/* 🎞️ Static Scanline Overlay for Incoming */}
                    {!isOwnMessage && (
                        <div className="absolute inset-0 scanline opacity-[0.05] pointer-events-none rounded-[2rem]" />
                    )}

                    {/* 📼 Data Content Area */}
                    <div className="relative z-10">
                        {["voice", "image", "video", "file"].includes(message.messageType) ? (
                            <div className="rounded-2xl overflow-hidden border border-white/5 shadow-inner bg-black/20">
                                <MediaRenderer 
                                    type={message.messageType} 
                                    url={displayContent} 
                                    fileName={message.fileName} 
                                    crossOrigin="anonymous" 
                                />
                            </div>
                        ) : (
                            <p className={`whitespace-pre-wrap leading-relaxed font-bold tracking-tight ${isOwnMessage ? "text-white" : "text-zinc-200"}`}>
                                {displayContent}
                            </p>
                        )}
                    </div>

                    {/* 👻 Ghost Protocol Status Node */}
                    {activeGhost && (
                        <div className="absolute -top-2 -right-2 bg-[#0B0E14] border-2 border-syncra-pink rounded-xl w-7 h-7 flex items-center justify-center text-syncra-pink shadow-neon-pink z-20 animate-bounce">
                            <RiGhostFill size={14} />
                        </div>
                    )}
                </div>

                {/* 🗑️ Action Terminal: Purge (Specular Visibility) */}
                {isOwnMessage && !isDeleting && (
                    <button 
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 p-3 bg-white/5 border border-white/5 rounded-2xl text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all duration-500 transform hover:scale-110 hover:-rotate-12 active:scale-90"
                    >
                        <IoMdTrash size={18} />
                    </button>
                )}
            </div>

            {/* 📜 Telemetry Readout (Metadata) */}
            <div className={`flex items-center gap-3 mt-2.5 px-3 transition-opacity duration-700 group-hover:opacity-100 opacity-40 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">
                        {isOwnMessage ? "SYS_NODE_LOCAL" : (message.sender?.username?.toUpperCase() || "ANON_ID")}
                    </span>
                    {message.isRead && isOwnMessage && (
                        <div className="flex gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-syncra-pink shadow-neon-pink animate-pulse" />
                            <div className="w-1 h-1 rounded-full bg-syncra-pink shadow-neon-pink animate-pulse" />
                        </div>
                    )}
                </div>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <span className="text-[8px] font-mono text-zinc-700 font-bold uppercase tracking-widest">
                    {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                </span>
            </div>
        </div>
    );
};

export default React.memo(MessageBubble);