import React, { useState, useEffect } from "react";
import logo from "../../assets/Logo/logo1.png";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { IoMdPulse } from "react-icons/io";

const statusMessages = [
    "LOADING RSA PROTOCOLS...",
    "HANDSHAKE MODULE READY",
    "DECRYPTING SECURE VAULT",
    "SYNCING SYMMETRIC KEYS",
    "STABLIZING TUNNEL..."
  ];

const SplashScreen = () => {
  const [status, setStatus] = useState("INITIALIZING SECURE VIBE");
  const [progress, setProgress] = useState(0);

  

  useEffect(() => {
    let currentMessage = 0;
    const messageInterval = setInterval(() => {
      currentMessage = (currentMessage + 1) % statusMessages.length;
      setStatus(statusMessages[currentMessage]);
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 100));
    }, 30);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] z-[9999] overflow-hidden perspective-1000">
      
      {/* 🌌 1. 3D Ambient Space (Parallax Layers) */}
      <div className="absolute w-[800px] h-[800px] bg-syncra-pink/5 rounded-full blur-[150px] animate-pulse-slow -z-10" />
      <div className="absolute inset-0 scanline opacity-30 z-20 pointer-events-none" />

      {/* 🛡️ 2. Main Content Architecture */}
      <div className="flex flex-col items-center relative z-10 animate-surge">
        
        {/* Logo with 3D Depth & Specular Flare */}
        <div className="relative group preserve-3d">
          {/* Layered Glows */}
          <div className="absolute -inset-16 bg-syncra-pink/10 rounded-full blur-[80px] opacity-40 animate-pulse" />
          <div className="absolute -inset-8 bg-syncra-pink/5 rounded-full blur-2xl animate-ping opacity-30" />
          
          <div className="relative p-6 bg-white/[0.02] border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-glass-surface transition-transform duration-1000 group-hover:rotate-y-12">
            <img 
              src={logo} 
              alt="Syncra Identity" 
              className="w-32 h-32 relative z-10 filter drop-shadow-[0_0_20px_rgba(255,45,85,0.5)]"
            />
          </div>
        </div>

        {/* Brand Name (Italicized 3D Typography) */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <h1 className="text-7xl font-black tracking-[0.3em] uppercase text-white italic transition-all duration-700 hover:tracking-[0.5em] cursor-default">
            SYN<span className="text-syncra-pink drop-shadow-[0_0_25px_rgba(255,45,85,0.6)]">CRA</span>
          </h1>
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-syncra-pink/5 border border-syncra-pink/20 shadow-neon-pink">
             <HiOutlineShieldCheck className="text-syncra-pink animate-spin-slow" />
             <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/80">
                Military Grade Node
             </span>
          </div>
        </div>

        {/* 📟 3. Tactical Progress Matrix */}
        <div className="mt-20 w-80 flex flex-col gap-5">
          <div className="flex justify-between items-end px-1">
            <div className="flex flex-col gap-1">
               <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">System Status</span>
               <span className="text-[10px] font-mono text-syncra-pink font-black animate-pulse flex items-center gap-2">
                 <IoMdPulse /> {status}
               </span>
            </div>
            <div className="text-right">
               <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest block">Payload</span>
               <span className="text-xs font-mono text-white/40">{progress}%</span>
            </div>
          </div>
          
          {/* 3D Progress Track */}
          <div className="relative h-[4px] w-full bg-white/5 rounded-full overflow-hidden rim-light">
            <div 
              className="h-full bg-gradient-to-r from-transparent via-syncra-pink to-syncra-pink shadow-neon-pink transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between opacity-20">
             <div className="h-1 w-1 bg-white rounded-full animate-ping" />
             <div className="h-1 w-1 bg-white rounded-full animate-ping delay-75" />
             <div className="h-1 w-1 bg-white rounded-full animate-ping delay-150" />
          </div>
        </div>
      </div>

      {/* 📜 Terminal Metadata Footer */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2 select-none pointer-events-none transition-opacity duration-1000 opacity-20 hover:opacity-100">
          <div className="h-px w-12 bg-zinc-800 mb-2" />
          <span className="text-[8px] font-mono font-black uppercase tracking-[0.5em] text-syncra-silver">
            TERMINAL_ID: {Math.random().toString(36).substring(7).toUpperCase()}
          </span>
          <span className="text-[8px] font-mono font-black uppercase tracking-[0.5em] text-syncra-pink">
            ENCRYPTION: AES_256_GCM_READY
          </span>
      </div>
    </div>
  );
};

export default SplashScreen;