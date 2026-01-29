import React from "react";

const Loader = ({ text = "Syncing Node", fullScreen = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center gap-6 p-10 transition-all duration-500 ${
            fullScreen 
            ? "fixed inset-0 z-[9999] bg-[#050505]/90 backdrop-blur-2xl" 
            : "relative w-full h-full bg-transparent"
        }`}>
            
            {/* ✅ Futuristic Scanner/Pulse Effect */}
            <div className="relative flex items-center justify-center">
                {/* Outer Glow Ring */}
                <div className="absolute w-24 h-24 rounded-full border border-syncra-pink/20 animate-ping opacity-20" />
                
                {/* Main Spinning Scanner */}
                <div className="w-16 h-16 border-t-2 border-r-2 border-syncra-pink rounded-full animate-spin shadow-[0_0_20px_rgba(255,45,85,0.4)]" />
                
                {/* Inner Core Pulse */}
                <div className="absolute w-8 h-8 bg-syncra-pink/10 rounded-full border border-syncra-pink/30 animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 bg-syncra-pink rounded-full shadow-[0_0_10px_#ff2d55]" />
                </div>
            </div>

            {/* Loading Metadata */}
            <div className="text-center space-y-2">
                <p className="text-[10px] text-white font-black uppercase tracking-[0.5em] animate-pulse">
                    {text}
                </p>
                <div className="flex items-center justify-center gap-1 opacity-30">
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
                </div>
            </div>

            {/* Bottom Status Tag (Optional Aesthetic) */}
            <div className="absolute bottom-10 px-4 py-1 border border-white/5 bg-white/[0.02] rounded-full">
                <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                    Kernel 1.0.4 // Signal Stable
                </span>
            </div>
        </div>
    );
};

export default Loader;