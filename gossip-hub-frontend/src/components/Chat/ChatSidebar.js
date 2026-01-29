import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SearchUser from "./SearchUser";
import ContactList from "../Contacts/ContactList";
import CallHistory from "../Calling/CallHistory"; 
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { IoMdChatbubbles, IoMdContacts, IoMdSettings, IoMdPulse, IoMdSearch } from "react-icons/io"; 
import { MdPhone } from "react-icons/md";

const ChatSidebar = ({ chats, onSelectChat, selectedId }) => {
    const [activeTab, setActiveTab] = useState("chats"); 
    const [chatSearchQuery, setChatSearchQuery] = useState(""); // 🔍 Filter state
    const { user: currentUser } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        if (!socket) return;
        const handleStatusUpdate = (data) => {
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                if (data.isOnline) newSet.add(data.userId.toString());
                else newSet.delete(data.userId.toString());
                return newSet;
            });
        };
        socket.on("user_status_update", handleStatusUpdate);
        return () => socket.off("user_status_update", handleStatusUpdate);
    }, [socket]);

    const getChatInfo = (chat) => {
        if (!chat || !chat.users) return { name: "Loading...", isOnline: false };
        const currentUserId = (currentUser?.id || currentUser?._id)?.toString();
        const otherUser = chat.users.find((u) => (u?._id || u)?.toString() !== currentUserId);
        return {
            name: otherUser?.username || "Secure Node",
            isOnline: onlineUsers.has(otherUser?._id?.toString()) || otherUser?.isOnline,
            image: otherUser?.image
        };
    };

    // 🕵️‍♂️ Filtering Logic for Active Channels
    const filteredChats = useMemo(() => {
        return chats?.filter(chat => {
            const info = getChatInfo(chat);
            return info.name.toLowerCase().includes(chatSearchQuery.toLowerCase());
        });
    }, [chats, chatSearchQuery]);

    return (
        <div className="flex flex-col h-full bg-[#050505] border-r border-white/5 relative overflow-hidden">
            {/* 🛸 1. Global Network Search (Holographic Results) */}
            <div className="p-5 bg-white/[0.01] border-b border-white/5 z-[100]">
                <SearchUser />
            </div>

            {/* 📟 2. Tactical Tab Navigation */}
            <div className="flex bg-black/40 backdrop-blur-xl border-b border-white/5">
                {["chats", "contacts", "calls"].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-4 text-[9px] uppercase tracking-[0.3em] transition-all flex flex-col items-center gap-1 ${
                            activeTab === tab 
                            ? "text-syncra-pink bg-syncra-pink/5 font-black shadow-[inset_0_-2px_0_#ff2d55]" 
                            : "text-zinc-600 hover:text-zinc-400"
                        }`}
                    >
                        {tab === "chats" && <IoMdChatbubbles className="text-sm" />}
                        {tab === "contacts" && <IoMdContacts className="text-sm" />}
                        {tab === "calls" && <MdPhone className="text-sm" />}
                        <span className="hidden lg:inline">{tab}</span>
                    </button>
                ))}
            </div>

            {/* 🎞️ 3. Main Data Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-28">
                {activeTab === "chats" ? (
                    <div className="flex flex-col p-2 gap-1">
                        {/* 🔎 Local Conversation Filter */}
                        <div className="px-4 py-3 group">
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl group-focus-within:border-syncra-pink/30 transition-all">
                                <IoMdSearch className="text-zinc-600 text-sm" />
                                <input 
                                    type="text" 
                                    placeholder="Filter Feed..."
                                    value={chatSearchQuery}
                                    onChange={(e) => setChatSearchQuery(e.target.value)}
                                    className="bg-transparent text-[10px] uppercase tracking-widest text-white outline-none w-full placeholder:text-zinc-800 font-bold"
                                />
                            </div>
                        </div>

                        <div className="px-4 pt-2 flex items-center gap-2">
                            <IoMdPulse className="text-syncra-pink animate-pulse text-[10px]" />
                            <h4 className="text-[8px] uppercase tracking-[0.4em] font-black text-zinc-700">Active_Channels</h4>
                        </div>

                        {filteredChats?.map((chat) => {
                            const info = getChatInfo(chat);
                            return (
                                <div 
                                    key={chat._id} 
                                    onClick={() => onSelectChat(chat)}
                                    className={`group mx-2 px-4 py-4 rounded-[1.8rem] cursor-pointer transition-all duration-300 border border-transparent ${
                                        selectedId === chat._id 
                                        ? "bg-white/[0.04] border-white/10 shadow-neon-pink/5" 
                                        : "hover:bg-white/[0.02]"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className={`w-11 h-11 rounded-2xl bg-zinc-900 border p-0.5 transition-all duration-500 ${selectedId === chat._id ? 'border-syncra-pink shadow-neon-pink' : 'border-white/10'}`}>
                                                <img src={info.image} alt="" className="w-full h-full rounded-2xl object-cover grayscale-[20%] group-hover:grayscale-0" />
                                            </div>
                                            {info.isOnline && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505] shadow-[0_0_8px_#22c55e]" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h5 className={`text-[13px] font-black tracking-tight ${selectedId === chat._id ? "text-white" : "text-zinc-400"}`}>
                                                    {info.name}
                                                </h5>
                                                <span className="text-[7px] font-mono text-zinc-700 uppercase">
                                                    {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '00:00'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] text-zinc-600 truncate max-w-[80%] font-medium">
                                                    {chat.latestMessage?.content || "TRANSMISSION_IDLE"}
                                                </p>
                                                {chat.unreadCount > 0 && (
                                                    <span className="bg-syncra-pink text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-neon-pink">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : activeTab === "contacts" ? <ContactList /> : <CallHistory />}
            </div>

            {/* ⌨️ 4. User Identity Terminal */}
            <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#0B0E14]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center justify-between z-30 shadow-2xl">
                <div onClick={() => navigate("/settings")} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <img src={currentUser?.image} className="w-9 h-9 rounded-2xl border border-syncra-pink/20 group-hover:border-syncra-pink transition-all" alt="User" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black animate-pulse shadow-neon-pink" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase italic">{currentUser?.username}</span>
                        <span className="text-[6px] text-zinc-600 uppercase tracking-[0.4em] font-mono">NODE_ACTIVE</span>
                    </div>
                </div>
                <button onClick={() => navigate("/settings")} className="p-2.5 rounded-xl bg-white/5 text-zinc-600 hover:text-syncra-pink transition-all">
                    <IoMdSettings className="text-lg" />
                </button>
            </div>
        </div>
    );
};

export default ChatSidebar;