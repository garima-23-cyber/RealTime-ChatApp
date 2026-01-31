import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useContact } from '../../context/ContactContext'; // 🛰️ Added for syncing
import { deleteNotification } from '../../api/notificationAPI';
import { acceptFriendRequest } from '../../api/contactAPI'; // 🛰️ Added for actions
import { toast } from 'react-toastify';
import { 
    IoMdNotifications, 
    IoMdTrash, 
    IoMdFingerPrint, 
    IoMdPersonAdd, 
    IoMdAlert,
    IoMdPulse,
    IoMdCheckmark,
    IoMdClose
} from "react-icons/io";

const NotificationDropdown = () => {
    const { notifications, setNotifications, handleMarkAsRead, unreadCount } = useNotification();
    const { refreshContacts } = useContact(); // 🔍 To refresh Search UI on accept

    const handleAccept = async (notification) => {
        // notification.sender holds the ID of the person who sent the request
        const acceptPromise = acceptFriendRequest(notification.sender._id || notification.sender);

        toast.promise(acceptPromise, {
            pending: 'Establishing Secure Link...',
            success: 'Handshake Complete: Node Linked 🤝',
            error: 'Connection Reset by Peer',
        });

        try {
            await acceptPromise;
            // 🚀 Refresh Contacts so "Connect" turns to "Linked" in SearchUser
            refreshContacts(); 
            // Purge the notification after successful link
            handleDelete(notification._id); 
        } catch (err) {
            console.error("Link Error:", err);
        }
    };

    const handleDelete = async (id) => {
        const deletePromise = deleteNotification(id);
        toast.promise(deletePromise, {
            pending: 'Executing Purge...',
            success: 'Alert Purged ⚡',
            error: 'Access Denied',
        });

        try {
            await deletePromise;
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) { }
    };

    const getIcon = (type) => {
        switch (type?.toUpperCase()) {
            case 'FRIEND_REQUEST': return <IoMdPersonAdd className="text-syncra-pink" />;
            case 'SECURITY': return <IoMdFingerPrint className="text-blue-400" />;
            case 'SYSTEM': return <IoMdAlert className="text-amber-400" />;
            default: return <IoMdNotifications className="text-syncra-pink" />;
        }
    };

    return (
        <div className="absolute right-0 mt-4 w-[380px] bg-[#0B0E14]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-glass-surface z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-300 origin-top-right">
            
            {/* 📡 Tactical Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.03]">
                <div className="flex items-center gap-3">
                    <IoMdPulse className="text-syncra-pink animate-pulse" />
                    <div className="flex flex-col">
                        <h3 className="text-white font-black text-[10px] uppercase tracking-[0.4em]">Secure Alerts</h3>
                        <span className="text-[7px] text-zinc-600 font-mono mt-1 tracking-widest">NODE_STATUS: ACTIVE</span>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button onClick={() => handleMarkAsRead()} className="px-3 py-1.5 rounded-lg bg-syncra-pink/10 border border-syncra-pink/20 text-[8px] text-syncra-pink hover:bg-syncra-pink hover:text-white font-black uppercase tracking-[0.2em] transition-all">
                        Clear Buffer
                    </button>
                )}
            </div>

            {/* 🎞️ Scrollable Signal Stream */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center gap-4 opacity-10">
                        <IoMdNotifications size={28} />
                        <p className="text-[9px] uppercase font-black tracking-[0.5em]">No Signals Detected</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div key={n._id} className={`group p-6 border-b border-white/5 flex gap-5 transition-all ${!n.isRead ? 'bg-syncra-pink/[0.02]' : ''}`}>
                            
                            {!n.isRead && <div className="absolute top-0 left-0 w-1 h-full bg-syncra-pink shadow-neon-pink" />}

                            <div className="mt-1 shrink-0">
                                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-syncra-pink/30">
                                    {getIcon(n.type)}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-2 min-w-0">
                                <div className="flex justify-between items-start">
                                    <span className="text-[8px] text-syncra-pink font-black uppercase tracking-[0.3em] opacity-40">
                                        Type::{n.type?.replace('_', ' ') || 'Notice'}
                                    </span>
                                    <button onClick={() => handleDelete(n._id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-500 transition-all">
                                        <IoMdTrash size={16} />
                                    </button>
                                </div>

                                <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-white' : 'text-zinc-400'}`}>
                                    {n.content}
                                </p>

                                {/* 🛠️ ACTIONABLE CONTROLS: Only for Friend Requests */}
                                {n.type === 'FRIEND_REQUEST' && (
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => handleAccept(n)}
                                            className="flex-1 py-2 bg-white text-black text-[9px] font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-syncra-pink hover:text-white transition-all shadow-neon-white"
                                        >
                                            <IoMdCheckmark size={14}/> Accept
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(n._id)}
                                            className="px-4 py-2 bg-zinc-900 text-zinc-400 text-[9px] font-black uppercase rounded-xl border border-white/5 hover:border-red-500/50 hover:text-red-500 transition-all"
                                        >
                                            <IoMdClose size={14}/> Decline
                                        </button>
                                    </div>
                                )}

                                <span className="text-[7px] text-zinc-700 font-mono uppercase mt-1">
                                    Timestamp // {new Date(n.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                <p className="text-[7px] text-zinc-800 uppercase font-black tracking-[0.4em] italic leading-none">
                    End-to-End_Encrypted_Signal_Loop
                </p>
            </div>
        </div>
    );
};

export default NotificationDropdown;