import React, { useEffect, useState } from "react";
import CallHistoryItem from "./CallHistoryItem";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import { FiHash } from "react-icons/fi";
import { IoMdCall, IoMdPulse } from "react-icons/io";

const CallHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    const getHistory = async () => {
      try {
        const { data } = await API.get("/call/history");
        setHistory(data.logs);
      } catch (err) {
        console.error("Failed to fetch call logs");
      } finally {
        setLoading(false);
      }
    };
    getHistory();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
        <IoMdPulse className="text-syncra-pink text-3xl animate-pulse" />
        <div className="text-[9px] font-mono uppercase tracking-[0.5em] text-white">Syncing_Signal_Logs...</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden perspective-1000">
      
      {/* 📡 1. Tactical Header */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl flex items-center justify-between rim-light">
        <div className="flex items-center gap-3">
            <FiHash className="text-syncra-pink shadow-neon-pink" />
            <h2 className="text-white font-black uppercase tracking-[0.4em] text-[10px] italic">Signal History</h2>
        </div>
        <span className="text-[8px] font-mono text-zinc-600">NODE_LOGS // {history.length.toString().padStart(3, '0')}</span>
      </div>

      {/* 🎞️ 2. Signal Corridor (Scrollable List) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar preserve-3d">
        {history.length > 0 ? (
          history.map((log) => (
            <div key={log._id} className="animate-in fade-in slide-in-from-right-4 duration-500 hover:translate-x-1 transition-transform">
                <CallHistoryItem log={log} currentUserId={currentUserId} />
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-ping" />
                <IoMdCall className="text-6xl text-white relative z-10" />
            </div>
            <p className="text-[9px] uppercase font-black tracking-[0.8em] text-white text-center">
                Archive Empty<br/>No Transmissions Detected
            </p>
          </div>
        )}
      </div>

      {/* 🛠️ 3. Footer Telemetry Overlay */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-[0.02] z-20" />
    </div>
  );
};

export default CallHistory;