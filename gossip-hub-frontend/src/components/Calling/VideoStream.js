import React, { useEffect, useRef } from "react";
import { FiCameraOff, FiMic } from "react-icons/fi";
import { IoMdPulse } from "react-icons/io";

const VideoStream = ({ stream, isLocal, username }) => {
  const videoRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;

    if (isLocal) {
      video.muted = true;
    }

    const hasVideo = stream.getVideoTracks().length > 0;

    if (hasVideo) {
      video.onloadedmetadata = () => {
        video.play().catch(err => {
          console.warn("Signal Blocked: Check Permissions", err);
        });
      };
    }

    return () => {
      if (video) video.srcObject = null;
    };
  }, [stream, isLocal]);

  const hasVideoTrack = stream?.getVideoTracks().some(track => track.enabled);

  return (
    <div className="relative group w-full h-full bg-[#050505] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-glass-surface transition-all duration-700 perspective-1000 preserve-3d">
      
      {/* 🌌 Specular Flare Layer */}
      <div className={`absolute -bottom-24 -right-24 w-80 h-80 blur-[120px] pointer-events-none transition-all duration-1000 z-10 ${isLocal ? 'bg-green-500/10' : 'bg-syncra-pink/20'}`} />

      {stream && hasVideoTrack ? (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          crossOrigin="anonymous" 
          className="w-full h-full object-cover transition-all duration-1000"
          style={{ 
            transform: isLocal ? "rotateY(180deg)" : "none",
            filter: "contrast(1.1) brightness(1.1) saturate(1.1)" 
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full space-y-6 bg-gradient-to-b from-[#0B0E14] to-[#050505] relative">
          {/* 3D Placeholder Orb */}
          <div className="relative">
            <div className="absolute inset-0 bg-syncra-pink/20 blur-[40px] rounded-full animate-pulse" />
            <div className="w-28 h-28 rounded-[2rem] bg-zinc-900 flex items-center justify-center border-2 border-white/5 relative z-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700 shadow-neon-pink">
                {stream ? (
                <FiMic className="text-white text-4xl animate-pulse" />
                ) : (
                <FiCameraOff className="text-zinc-700 text-4xl" />
                )}
            </div>
          </div>
          
          <div className="text-center relative z-10">
            <h3 className="text-white font-black text-[12px] uppercase tracking-[0.5em] italic">
              {stream ? "Audio_Link" : "Signal_Lost"}
            </h3>
            <p className="text-zinc-600 text-[8px] font-mono uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-zinc-800 rounded-full animate-ping" />
              {stream ? "P2P_VOICE_STABLE" : "SCANNING_FOR_PEER..."}
            </p>
          </div>
        </div>
      )}

      {/* 📟 Tactical HUD Overlays */}
      <div className="absolute top-8 left-8 z-20">
         <div className="bg-black/60 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-glass-sm rim-light">
            <IoMdPulse className={`text-sm ${isLocal ? 'text-green-500' : 'text-syncra-pink animate-pulse'}`} />
            <span className="text-[10px] text-white font-black uppercase tracking-[0.3em] italic">
                {username} {isLocal && "//_Node"}
            </span>
         </div>
      </div>

      <div className="absolute bottom-8 left-8 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
         <div className="flex flex-col gap-1">
            <span className="text-[7px] text-zinc-500 font-mono font-bold uppercase tracking-widest leading-none">Status: Encrypted</span>
            <span className="text-[8px] text-syncra-pink font-mono font-bold">AES_256_LIVE</span>
         </div>
      </div>

      <div className="absolute top-8 right-8 z-20">
         <div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
            <span className="text-[8px] text-zinc-500 font-mono font-black tracking-widest uppercase">
              Latency: 42ms
            </span>
         </div>
      </div>

      {/* 🎞️ Scanning Screen Lines */}
      <div className="absolute inset-0 scanline opacity-[0.04] pointer-events-none z-10" />
    </div>
  );
};

export default VideoStream;