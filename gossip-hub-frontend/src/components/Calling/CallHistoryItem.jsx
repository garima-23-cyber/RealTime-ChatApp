import React from "react";
import { IoMdVideocam, IoMdCall } from "react-icons/io";
import { MdCallReceived, MdCallMade, MdCallMissed } from "react-icons/md";
import { format } from "date-fns";

const CallHistoryItem = ({ log, currentUserId }) => {
  const isIncoming = log.participants[1]?._id === currentUserId; 
  const isMissed = log.status === "missed";
  const otherUser = log.participants.find(p => p._id !== currentUserId) || {};

  return (
    <div className="group relative flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-3xl transition-all duration-500 hover:bg-white/[0.05] hover:border-white/10 hover:-translate-y-1 preserve-3d shadow-glass-sm hover:shadow-glass-surface rim-light overflow-hidden">
      
      {/* 🔮 Background Status Flare */}
      <div className={`absolute -inset-10 opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl pointer-events-none ${isMissed ? 'bg-red-500' : 'bg-syncra-pink'}`} />

      <div className="flex items-center gap-4 relative z-10">
        {/* 🛡️ 3D Avatar Node */}
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 group-hover:border-syncra-pink/50 transition-all duration-700 shadow-inner p-0.5 bg-syncra-dark">
            <img 
              src={otherUser.image || "/default-avatar.png"} 
              alt="Node Identity" 
              className="w-full h-full rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" 
            />
          </div>
          
          {/* Hardware Sub-Icon */}
          <div className="absolute -bottom-1 -right-1 bg-[#050505] p-1.5 rounded-xl border border-white/10 shadow-neon-pink">
            {log.callType === "video" ? 
              <IoMdVideocam className="text-syncra-pink text-[10px]" /> : 
              <IoMdCall className="text-syncra-pink text-[10px]" />
            }
          </div>
        </div>

        {/* 📜 Identity Metadata */}
        <div>
          <h4 className="text-white text-sm font-black tracking-tight uppercase italic group-hover:text-syncra-pink transition-colors">
            {otherUser.username}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className={`flex items-center justify-center p-1 rounded-md bg-white/5 border border-white/5`}>
                {isMissed ? (
                  <MdCallMissed className="text-red-500 text-[10px]" />
                ) : isIncoming ? (
                  <MdCallReceived className="text-green-500 text-[10px]" />
                ) : (
                  <MdCallMade className="text-blue-500 text-[10px]" />
                )}
            </div>
            <span className="text-[8px] text-zinc-600 font-mono font-black uppercase tracking-[0.2em]">
              {format(new Date(log.startTime), "MMM d // HH:mm:ss")}
            </span>
          </div>
        </div>
      </div>

      {/* 📟 Telemetry: Duration/Status */}
      <div className="text-right relative z-10">
        {log.duration > 0 ? (
          <div className="flex flex-col items-end gap-1">
             <span className="text-[7px] text-zinc-700 font-black uppercase tracking-widest">Uptime_Log</span>
             <span className="text-[10px] text-white font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                {Math.floor(log.duration / 60)}m {log.duration % 60}s
             </span>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1">
             <span className="text-[7px] text-red-500/40 font-black uppercase tracking-widest animate-pulse">Disconnected</span>
             <span className="text-[9px] text-red-500 font-black uppercase tracking-tighter italic">
                {log.status === "declined" ? "REJECTED" : "UNANSWERED"}
             </span>
          </div>
        )}
      </div>

      {/* 🎞️ Scanning Line Decoration */}
      <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none" />
    </div>
  );
};

export default CallHistoryItem;