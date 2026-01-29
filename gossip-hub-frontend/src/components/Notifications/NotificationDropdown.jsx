import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { deleteNotification } from '../../api/notificationAPI';
import { toast } from 'react-toastify'; // ✅ Standardizing with Toastify
import { 
    IoMdNotifications, 
    IoMdTrash, 
    IoMdDoneAll, 
    IoMdFingerPrint, 
    IoMdPersonAdd, 
    IoMdAlert,
    IoMdPulse
} from "react-icons/io";

const NotificationDropdown = () => {
    const { notifications, setNotifications, handleMarkAsRead, unreadCount } = useNotification();

    const handleDelete = async (id) => {
        const deletePromise = deleteNotification(id);

        toast.promise(deletePromise, {
            pending: 'Executing Purge Sequence...',
            success: 'Alert Purged from Matrix ⚡',
            error: 'CRITICAL_ERROR: Access Denied',
        });

        try {
            await deletePromise;
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error("Purge Error:", err);
        }
    };

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'request': return <IoMdPersonAdd className="text-syncra-pink" />;
            case 'security': return <IoMdFingerPrint className="text-blue-400" />;
            case 'system': return <IoMdAlert className="text-amber-400" />;
            default: return <IoMdNotifications className="text-syncra-pink" />;
        }
    };

    return (
        <div className="absolute right-0 mt-4 w-[360px] bg-[#0B0E14]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-glass-surface z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-300 origin-top-right perspective-1000 rim-light">
            
            {/* 📡 Tactical Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.03]">
                <div className="flex items-center gap-3">
                    <IoMdPulse className="text-syncra-pink animate-pulse" />
                    <div className="flex flex-col">
                        <h3 className="text-white font-black text-[10px] uppercase tracking-[0.4em] leading-none">Secure Alerts</h3>
                        <span className="text-[7px] text-zinc-600 font-mono mt-1 tracking-widest uppercase">NODE_STATUS: ACTIVE</span>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={() => handleMarkAsRead()} 
                        className="px-3 py-1.5 rounded-lg bg-syncra-pink/10 border border-syncra-pink/20 text-[8px] text-syncra-pink hover:bg-syncra-pink hover:text-white font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                    >
                        Clear Buffer
                    </button>
                )}
            </div>

            {/* 🎞️ Scrollable Signal Stream */}
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar bg-transparent relative">
                {notifications.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center gap-4 opacity-10">
                        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center animate-orbit-slow">
                            <IoMdNotifications size={28} />
                        </div>
                        <p className="text-[9px] uppercase font-black tracking-[0.5em] italic">No Signals Detected</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div key={n._id} 
                             className={`group p-6 border-b border-white/5 flex gap-5 transition-all duration-500 hover:bg-white/[0.04] relative overflow-hidden ${!n.isRead ? 'bg-syncra-pink/[0.02]' : ''}`}
                             onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                        >
                            {/* Specular Glow for unread */}
                            {!n.isRead && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-syncra-pink shadow-neon-pink z-20" />
                            )}

                            {/* 🛡️ Icon Node */}
                            <div className="mt-1 shrink-0">
                                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 shadow-inner group-hover:border-syncra-pink/30 transition-colors">
                                    {getIcon(n.type)}
                                </div>
                            </div>

                            {/* 📜 Telemetry Content */}
                            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                                <div className="flex justify-between items-start">
                                    <span className="text-[8px] text-syncra-pink font-black uppercase tracking-[0.3em] opacity-40">
                                        Type::{n.type || 'Notice'}
                                    </span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }} 
                                        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 transition-all transform hover:rotate-12"
                                    >
                                        <IoMdTrash size={16} />
                                    </button>
                                </div>
                                <p className={`text-xs leading-relaxed font-medium transition-colors ${!n.isRead ? 'text-white' : 'text-zinc-400'}`}>
                                    {n.content}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[7px] text-zinc-700 font-mono uppercase tracking-widest">
                                        Timestamp // {new Date(n.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 🛠️ Footer Analytics */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center relative">
                <div className="absolute inset-0 scanline opacity-[0.03] pointer-events-none" />
                <p className="text-[7px] text-zinc-800 uppercase font-black tracking-[0.4em] italic leading-none">
                    End-to-End_Encrypted_Signal_Loop
                </p>
            </div>
        </div>
    );
};

export default NotificationDropdown;