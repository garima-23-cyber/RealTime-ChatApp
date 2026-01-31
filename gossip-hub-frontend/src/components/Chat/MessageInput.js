import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { useMediaRecorder } from "../../hooks/useMediaRecorder";
import { uploadMedia } from "../../api/messageAPI";
import { toast } from "react-toastify"; // ✅ Switched to your new Toastify system
import { IoMdSend, IoMdMic,  IoMdAttach, IoMdPulse } from "react-icons/io";

const MessageInput = ({ chatId, setMessages, isGhostMode, isBlocked }) => {
    const [text, setText] = useState("");
    const [typing, setTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    const { socket } = useSocket();
    const { user } = useAuth();
    const { isRecording, startRecording, stopRecording } = useMediaRecorder();

    // 1. WebSocket Confirmation Listener
    useEffect(() => {
        if (!socket) return;
        const handleConfirm = ({ tempId, realMessage }) => {
            setMessages((prev) => prev.map((m) => (m._id === tempId ? realMessage : m)));
        };
        socket.on("message_sent_confirm", handleConfirm);
        return () => socket.off("message_sent_confirm", handleConfirm);
    }, [socket, setMessages]);

    // 2. Typing Telemetry Sync
    useEffect(() => {
        if (!text && typing && socket) {
            socket.emit("stop typing", chatId);
            setTyping(false);
        }
    }, [text, chatId, socket, typing]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
            return;
        }
        if (!socket || isBlocked) return;
        
        if (!typing) {
            setTyping(true);
            socket.emit("typing", chatId);
        }
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (socket) {
                socket.emit("stop typing", chatId);
                setTyping(false);
            }
        }, 3000);
    };

    // 3. Data Transmission (Text)
    const handleSend = async (e) => {
        e?.preventDefault();
        if (!socket || !text.trim() || isBlocked || isUploading) return;

        const tempId = `temp-${Date.now()}`;
        const messageData = {
            _id: tempId,
            content: text.trim(),
            chat: { _id: chatId },
            sender: { _id: (user.id || user._id), username: user.username },
            createdAt: new Date().toISOString(),
            isGhostMode,
            messageType: "text",
        };

        setText("");
        setMessages((prev) => [...prev, messageData]);
        socket.emit("send message", messageData);
    };

    // 4. Media Handshake (File/Image)
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || isBlocked || !socket) return;
        
        const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
        const formData = new FormData();
        formData.append("media", file);

        setIsUploading(true);
        const uploadId = toast.info(`UPLOADING_${type.toUpperCase()}...`, { autoClose: false });

        try {
            const res = await uploadMedia(formData);
            const mediaMessage = {
                _id: `temp-media-${Date.now()}`,
                content: res.data.url, 
                messageType: type,
                fileName: file.name,
                chat: { _id: chatId },
                sender: { _id: (user.id || user._id), username: user.username },
                createdAt: new Date().toISOString(),
                isGhostMode,
            };
            setMessages((prev) => [...prev, mediaMessage]);
            socket.emit("send message", mediaMessage);
            toast.success("DATA_PACKET_LINKED", { id: uploadId });
        } catch (err) {
            toast.error("TRANSMISSION_ABORTED", { id: uploadId });
        } finally {
            setIsUploading(false);
        }
    };

    // 5. Audio Signal Capture
    const handleVoiceNote = async () => {
        if (isBlocked || !socket) return;
        if (!isRecording) {
            try {
                await startRecording();
                toast.info("RECORDING_SIGNAL...", { icon: '🎤' });
            } catch (err) { toast.error("HARDWARE_ERROR: Mic Denied"); }
        } else {
            const audioFile = await stopRecording();
            if (!audioFile) return;
            
            const formData = new FormData();
            formData.append("media", audioFile);
            const voiceId = toast.info("SYNCING_AUDIO...", { autoClose: false });

            try {
                const res = await uploadMedia(formData);
                const voiceMessage = {
                    _id: `temp-voice-${Date.now()}`,
                    content: res.data.url,
                    messageType: "voice",
                    chat: { _id: chatId },
                    sender: { _id: (user.id || user._id), username: user.username },
                    createdAt: new Date().toISOString(),
                    isGhostMode,
                };
                setMessages((prev) => [...prev, voiceMessage]);
                socket.emit("send message", voiceMessage);
                toast.success("SIGNAL_TRANSMITTED", { id: voiceId });
            } catch (err) { toast.error("AUDIO_SYNC_FAILED", { id: voiceId }); }
        }
    };

    return (
        <div className="w-full relative px-6 pb-6 perspective-1000">
            {/* 🛡️ Status Alert Overlay (Tactical Kernal Label) */}
            {isBlocked && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-red-600/10 border border-red-500/20 px-8 py-2 rounded-full backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-3 z-50 shadow-glass-sm">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.6em] flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
                        Access_Denied::Kernel_Locked
                    </span>
                </div>
            )}

            <form 
                onSubmit={handleSend} 
                className={`relative group flex items-center gap-5 p-2.5 bg-white/[0.01] border border-white/5 rounded-[3rem] backdrop-blur-3xl transition-all duration-1000 shadow-glass-surface rim-light preserve-3d ${isBlocked || !socket ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:border-white/20 hover:bg-white/[0.03]'}`}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                {/* 📎 Tactical Control Cluster */}
                <div className="flex items-center gap-3 pl-3">
                    <button 
                        type="button"
                        disabled={isUploading || isRecording || isBlocked}
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 rounded-[2rem] bg-zinc-900 border border-white/5 text-zinc-600 hover:text-white transition-all duration-500 hover:border-syncra-pink/40 hover:shadow-neon-pink active:scale-90 disabled:opacity-0"
                    >
                        <IoMdAttach className="text-xl" />
                    </button>

                    <button 
                        type="button"
                        disabled={isUploading || isBlocked}
                        onClick={handleVoiceNote}
                        className={`p-4 rounded-[2rem] border transition-all duration-700 preserve-3d active:scale-90 ${isRecording ? 'bg-syncra-pink border-syncra-pink shadow-neon-pink text-white scale-110 rotate-3' : 'bg-zinc-900 border-white/5 text-zinc-600 hover:text-syncra-pink hover:border-syncra-pink/30'}`}
                    >
                        {isRecording ? <IoMdPulse className="text-xl animate-spin-slow" /> : <IoMdMic className="text-xl" />}
                    </button>
                </div>

                {/* ⌨️ Data Transmission Field */}
                <div className="relative flex-1 group/field">
                    <input 
                        type="text" 
                        value={text} 
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setText(e.target.value)} 
                        placeholder={isBlocked ? "SYSTEM_LOCKED" : isRecording ? "CAPTURING_BITSTREAM..." : "ENTER_DATA_PACKET..."}
                        disabled={isRecording || isUploading || isBlocked || !socket}
                        className="w-full bg-transparent py-4 text-[13px] text-white focus:outline-none placeholder:text-zinc-800 font-black uppercase tracking-[0.3em] transition-all"
                    />
                    
                    {/* Ghost Mode Telemetry Indicator */}
                    {isGhostMode && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4 pr-6 pointer-events-none animate-in fade-in duration-1000">
                            <span className="text-[7px] text-syncra-pink font-black uppercase tracking-[0.5em] opacity-30 italic">Ghost_Handshake::On</span>
                            <div className="w-1.5 h-1.5 bg-syncra-pink rounded-full animate-ping shadow-neon-pink" />
                        </div>
                    )}
                </div>

                {/* 🚀 Uplink Button (Specular Shift) */}
                <button 
                    type="submit"
                    disabled={!text.trim() || isRecording || isUploading || isBlocked || !socket}
                    className="relative group/btn flex items-center justify-center bg-white text-black p-5 rounded-[2.5rem] transition-all duration-700 hover:bg-syncra-pink hover:text-white active:scale-90 disabled:opacity-0 disabled:translate-x-12 shadow-glass-sm hover:shadow-neon-pink overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-syncra-pink to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700" />
                    <IoMdSend className="relative z-10 text-xl group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-500" />
                </button>
            </form>

            {/* 🎞️ Base Alignment Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-syncra-pink/30 to-transparent blur-sm opacity-50" />
        </div>
    );
};

export default MessageInput;