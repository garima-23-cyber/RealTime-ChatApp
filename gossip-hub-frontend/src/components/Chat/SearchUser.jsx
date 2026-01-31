import React, { useState, useEffect } from "react";
import { searchUsers } from "../../api/chatAPI";
import { sendFriendRequest } from "../../api/contactAPI";
import { toast } from "react-toastify"; 
import { IoMdSearch, IoMdClose, IoMdPulse } from "react-icons/io";
// 🛰️ Using the new ContactContext we built
import { useContact } from "../../context/ContactContext"; 

const SearchUser = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    
    // 🔍 Pulling real-time lists from context
    const { friends, pendingRequests, refreshContacts } = useContact();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 3) performSearch();
            else setResults([]);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const performSearch = async () => {
        setSearching(true);
        try {
            const res = await searchUsers(query);
            setResults(res.data.users || []);
        } catch (err) {
            console.error("SEARCH_FAILURE:", err);
        } finally {
            setSearching(false);
        }
    };

    // 🛠️ Updated Helper: Checks existing lists to determine UI state
    const getStatus = (userId) => {
        // 1. Check if user is already in the contacts array
        if (friends?.some(f => f._id === userId)) return "FRIEND";
        
        // 2. Check if there is a pending request (sent or received)
        // Based on your backend, pendingRequests contains users who sent YOU a request
        if (pendingRequests?.some(r => r._id === userId)) return "PENDING";
        
        return "NONE";
    };

    const handleAddFriend = async (userId, username) => {
        // Your backend expects 'recipientId' in the body
        const requestPromise = sendFriendRequest(userId); 
        
        toast.promise(requestPromise, {
            pending: `Targeting Node::${username.toUpperCase()}...`,
            success: "Handshake Request Injected ✨",
            error: "Signal Blocked by Firewall"
        });

        try {
            await requestPromise;
            // 🚀 Refresh the global contact state so the button updates to "WAITING..."
            if(refreshContacts) await refreshContacts();
            
            // Optional: Clear search to show success
            setResults([]);
            setQuery("");
        } catch (err) { 
            console.error("Handshake failed", err);
        }
    };

    return (
        <div className="relative w-full font-inter z-[1000] perspective-1000">
            <div className="relative group/search">
                <div className={`flex gap-2 p-1.5 bg-[#0B0E14] border rounded-2xl transition-all duration-500 preserve-3d 
                    ${searching || results.length > 0 
                        ? 'border-syncra-pink shadow-neon-pink scale-[1.02] -translate-y-1' 
                        : 'border-white/10 group-hover/search:border-white/20'
                    } focus-within:border-syncra-pink focus-within:shadow-neon-pink focus-within:scale-[1.02] focus-within:-translate-y-1`}
                >
                    <div className="flex-1 flex items-center px-4 gap-3">
                        <div className="relative flex items-center justify-center">
                            <IoMdSearch className={`text-xl transition-all duration-700 
                                ${searching ? 'text-syncra-pink rotate-90 scale-125' : 'text-zinc-700'} 
                                group-focus-within/search:text-syncra-pink`} 
                            />
                            {searching && <div className="absolute inset-0 bg-syncra-pink blur-md opacity-40 animate-pulse" />}
                        </div>
                        
                        <input 
                            type="text" 
                            placeholder="SCAN_NETWORK_FOR_NODES..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent py-3 text-[11px] text-white focus:outline-none placeholder:text-zinc-800 font-black uppercase tracking-[0.2em]"
                        />
                        
                        {query && (
                            <button onClick={() => {setQuery(""); setResults([]);}} className="text-zinc-600 hover:text-white transition-transform hover:rotate-90">
                                <IoMdClose size={18} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-syncra-pink group-focus-within/search:w-3/4 transition-all duration-1000 opacity-50 blur-[2px]" />
            </div>

            {results.length > 0 && (
                <div className="absolute top-[125%] left-0 right-0 z-[1100] bg-[#0B0E14] border border-white/20 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,1)] max-h-[400px] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500">
                    <div className="sticky top-0 bg-[#121212] px-7 py-4 flex justify-between items-center border-b border-white/10 z-20">
                        <div className="flex items-center gap-2">
                            <IoMdPulse className="text-syncra-pink animate-pulse text-xs" />
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">SIGNALS_RECOVERED</span>
                        </div>
                        <span className="text-[10px] font-mono text-syncra-pink font-black px-2 py-0.5 bg-syncra-pink/10 rounded border border-syncra-pink/20">
                            {results.length} UNITS
                        </span>
                    </div>

                    <div className="p-2 flex flex-col gap-1 overflow-y-auto max-h-[340px] custom-scrollbar bg-[#0B0E14]">
                        {results.map((user) => {
                            const status = getStatus(user._id);
                            
                            return (
                                <div key={user._id} className="group/item flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white/[0.05] border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-white/10 p-0.5 group-hover/item:border-syncra-pink/40">
                                            <img src={user.image} alt="" className="w-full h-full rounded-lg object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-white uppercase italic">{user.username}</span>
                                            <span className="text-[8px] text-zinc-600 font-mono tracking-widest mt-0.5">ADDR::{user._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>

                                    {/* 🛰️ Logic-based Button Rendering */}
                                    {status === "FRIEND" ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-syncra-pink/10 border border-syncra-pink/30 rounded-lg">
                                            <IoMdPulse className="text-syncra-pink text-[10px] animate-pulse" />
                                            <span className="text-[9px] font-black text-syncra-pink uppercase tracking-tighter">LINKED</span>
                                        </div>
                                    ) : status === "PENDING" ? (
                                        <div className="px-4 py-2 bg-zinc-900 text-zinc-400 text-[9px] font-black uppercase rounded-lg border border-white/5 italic">
                                            WAITING...
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleAddFriend(user._id, user.username)} 
                                            className="bg-white text-black text-[9px] font-black uppercase px-4 py-2 rounded-lg hover:bg-syncra-pink hover:text-white transition-all active:scale-95 shadow-md"
                                        >
                                            CONNECT
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchUser;