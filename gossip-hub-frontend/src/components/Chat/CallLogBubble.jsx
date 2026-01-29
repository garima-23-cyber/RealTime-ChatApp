import React from "react";
import { IoMdVideocam, IoMdCall, IoMdPulse } from "react-icons/io";
import { MdCallMissed } from "react-icons/md";

const CallLogBubble = ({ message }) => {
  // Enhanced Detection Protocol
  const content = message.content?.toLowerCase() || "";
  const isMissed = content.includes("missed") || content.includes("declined") || content.includes("failed");
  const isVideo = content.includes("video");

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const durationStr = formatDuration(message.callDuration);

  return (
    <div className="flex justify-center w-full my-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 perspective-1000">
      <div className={`group relative flex flex-col items-center bg-white/[0.01] border px-16 py-8 rounded-[4rem] backdrop-blur-3xl shadow-glass-surface transition-all duration-700 preserve-3d hover:-rotate-x-2 rim-light ${isMissed ? 'border-red-500/20 hover:border-red-500/40' : 'border-white/5 hover:border-syncra-pink/30'}`}>
        
        {/* 🌌 Holographic Signal Flare */}
        <div className={`absolute inset-0 rounded-[4rem] blur-[80px] opacity-5 group-hover:opacity-15 transition-opacity duration-1000 pointer-events-none ${isMissed ? 'bg-red-500' : 'bg-syncra-pink'}`} />

        {/* 📟 Tactical System Tag */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-[#0B0E14] border border-white/10 rounded-xl flex items-center gap-3 z-20 shadow-2xl">
            <IoMdPulse className={`text-[10px] animate-pulse ${isMissed ? 'text-red-500 shadow-[0_0_8px_#ef4444]' : 'text-syncra-pink shadow-[0_0_8px_#ff2d55]'}`} />
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-400">COMMS_LOG_REPORT</span>
        </div>

        {/* 🎬 3D Hardware Icon Node */}
        <div className={`relative p-6 rounded-3xl mb-6 transform-gpu transition-all duration-700 group-hover:scale-110 group-hover:rotate-y-12 shadow-inner border ${isMissed ? 'bg-red-500/5 border-red-500/20' : 'bg-syncra-pink/5 border-white/10'}`}>
          {isMissed ? (
            <MdCallMissed className="text-4xl text-red-500 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
          ) : isVideo ? (
            <IoMdVideocam className="text-4xl text-syncra-pink filter drop-shadow-[0_0_12px_rgba(255,45,85,0.6)]" />
          ) : (
            <IoMdCall className="text-4xl text-syncra-pink filter drop-shadow-[0_0_12px_rgba(255,45,85,0.6)]" />
          )}
        </div>
        
        {/* 📜 Transmission Telemetry */}
        <div className="relative text-center z-10 flex flex-col items-center">
          <h4 className={`font-black text-[13px] uppercase tracking-[0.5em] mb-4 italic leading-none transition-colors ${isMissed ? 'text-red-500/90' : 'text-white'}`}>
            {message.content?.replace(/ /g, "_")}
          </h4>
          
          <div className="flex flex-col gap-3 items-center">
            <div className="flex items-center gap-4">
               <span className="text-zinc-600 text-[9px] font-mono uppercase tracking-[0.2em] bg-white/[0.02] px-3 py-1 rounded-md">
                 SEQ_TS: {new Date(message.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
               </span>
               
               {durationStr && (
                 <div className="flex items-center gap-2 px-4 py-1.5 bg-syncra-pink/10 border border-syncra-pink/20 rounded-xl shadow-neon-pink transition-transform group-hover:scale-105">
                     <span className="text-[7px] text-syncra-pink/60 font-black tracking-[0.3em] uppercase">UPTIME</span>
                     <span className="text-syncra-pink text-[10px] font-mono font-black">
                       {durationStr}
                     </span>
                 </div>
               )}
            </div>

            {/* Simulated Handshake Latency (Visual Polish) */}
            <div className="flex items-center gap-2 opacity-20">
                <div className="w-8 h-[1px] bg-zinc-800" />
                <span className="text-[6px] font-mono uppercase tracking-widest text-zinc-500">Latency: 24ms // Signal: Stable</span>
                <div className="w-8 h-[1px] bg-zinc-800" />
            </div>
          </div>
        </div>

        {/* 🎞️ CRT/HUD Scanline Layer */}
        <div className="absolute inset-0 scanline opacity-[0.03] pointer-events-none rounded-[4rem]" />
      </div>
    </div>
  );
};

export default CallLogBubble;