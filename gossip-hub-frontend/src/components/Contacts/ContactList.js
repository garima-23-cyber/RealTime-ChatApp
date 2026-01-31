import React, { useEffect, useState } from "react";
import { fetchLists, acceptFriendRequest } from "../../api/contactAPI";
import { accessChat } from "../../api/chatAPI";
import { toast } from "react-toastify"; // ✅ Switched to Toastify
import { 
    IoMdPersonAdd, 
    IoMdChatbubbles, 
    
    IoMdHand,
    IoMdPulse
} from "react-icons/io";

const ContactList = ({ onChatSelected }) => {
    const [lists, setLists] = useState({ contacts: [], pendingRequests: [] });
    const [loadingId, setLoadingId] = useState(null);

    const loadData = async () => {
        try {
            const res = await fetchLists();
            setLists(res.data.list);
        } catch (err) {
            toast.error("NETWORK_SYNC_FAILURE: Buffer unreachable");
        }
    };

    useEffect(() => { loadData(); }, []);

    // 1. Accept Identity Handshake
    const handleAccept = async (senderId, username) => {
        setLoadingId(senderId);
        const acceptPromise = acceptFriendRequest(senderId);

        toast.promise(acceptPromise, {
            pending: `Authorizing Node::${username.toUpperCase()}...`,
            success: "Identity Authorized ✨",
            error: "Handshake Protocol Failed ❌",
        });

        try {
            await acceptPromise;
            loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingId(null);
        }
    };

    // 2. Initialize Secure Session
    const handleStartChat = async (userId, username) => {
        const sessionPromise = accessChat(userId);

        toast.promise(sessionPromise, {
            pending: `Routing Secure Tunnel to ${username}...`,
            success: "P2P Link Established 🚀",
            error: "Tunnel Initialization Failed",
        });

        try {
            const res = await sessionPromise;
            if (onChatSelected) onChatSelected(res.data.chat);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col gap-10 p-6 font-inter bg-transparent h-full overflow-y-auto custom-scrollbar perspective-1000">
            
            {/* 🎞️ 1. PENDING SIGNALS SECTION */}
            {lists.pendingRequests.length > 0 && (
                <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="flex items-center justify-between px-3">
                        <div className="flex items-center gap-3">
                            <IoMdPulse className="text-syncra-pink animate-pulse" />
                            <h5 className="text-[10px] uppercase tracking-[0.4em] text-syncra-pink font-black italic">
                                Incoming_Handshakes
                            </h5>
                        </div>
                        <span className="text-[9px] bg-syncra-pink/10 text-syncra-pink px-2.5 py-0.5 rounded-lg font-mono font-black border border-syncra-pink/20 shadow-neon-pink">
                            {lists.pendingRequests.length.toString().padStart(2, '0')}
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {lists.pendingRequests.map(req => (
                            <div key={req._id} className="flex items-center justify-between p-5 bg-white/[0.02] backdrop-blur-3xl border border-syncra-pink/20 rounded-[2rem] group hover:border-syncra-pink/50 transition-all duration-500 shadow-glass-sm rim-light preserve-3d">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-syncra-pink/5 border border-syncra-pink/20 flex items-center justify-center text-syncra-pink shadow-inner group-hover:scale-110 transition-transform">
                                        <IoMdHand className="text-2xl animate-pulse" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-white italic tracking-tight">{req.username}</span>
                                        <span className="text-[8px] text-syncra-pink/60 uppercase font-black tracking-widest mt-0.5">Awaiting_Approval</span>
                                    </div>
                                </div>
                                <button 
                                    disabled={loadingId === req._id}
                                    onClick={() => handleAccept(req._id, req.username)} 
                                    className="bg-syncra-pink text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-neon-pink hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loadingId === req._id ? "SYNC..." : "Accept"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 🖥️ 2. AUTHORIZED NETWORK SECTION */}
            <div className="flex flex-col gap-5">
                <div className="px-3 flex items-center justify-between opacity-30">
                    <h5 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">
                        Verified_Node_Mesh
                    </h5>
                    <span className="text-[8px] font-mono tracking-widest">NET_V.4.2</span>
                </div>

                {lists.contacts.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {lists.contacts.map(friend => (
                            <div 
                                key={friend._id} 
                                className="flex items-center justify-between p-4 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 group cursor-pointer hover:-translate-y-1 preserve-3d shadow-glass-sm"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/5 p-0.5 bg-syncra-dark group-hover:border-syncra-pink/40 transition-colors duration-700">
                                            <img 
                                                src={friend.image} 
                                                alt="" 
                                                className="w-full h-full rounded-2xl object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" 
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#050505] rounded-full flex items-center justify-center border border-white/5">
                                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e] animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-black text-zinc-300 group-hover:text-white transition-colors uppercase italic tracking-tighter">
                                            {friend.username}
                                        </span>
                                        <span className="text-[7px] text-zinc-600 uppercase font-black tracking-[0.3em]">
                                            Identity_Confirmed
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleStartChat(friend._id, friend.username)} 
                                    className="flex items-center gap-2 text-zinc-500 group-hover:text-syncra-pink text-[9px] font-black uppercase tracking-widest bg-white/[0.02] group-hover:bg-syncra-pink/10 px-5 py-3 rounded-xl transition-all active:scale-95 border border-white/5 group-hover:border-syncra-pink/40"
                                >
                                    <IoMdChatbubbles className="text-sm" /> Handshake
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center opacity-10">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-ping" />
                            <IoMdPersonAdd size={48} className="relative z-10 text-white" />
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.8em] font-black text-white">Mesh_Empty</p>
                        <p className="text-[7px] uppercase tracking-[0.4em] text-zinc-500 mt-2">Scan for nodes to establish link</p>
                    </div>
                )}
            </div>

            {/* 🎞️ Full Page Decoration Overlay */}
            <div className="absolute inset-0 pointer-events-none scanline opacity-[0.02] z-50" />
        </div>
    );
};

export default ContactList;