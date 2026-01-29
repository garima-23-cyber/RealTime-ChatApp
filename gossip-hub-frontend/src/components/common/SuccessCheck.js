import React, { useEffect } from "react";
import { IoMdCheckmark } from "react-icons/io";

const SuccessCheck = ({ text = "Changes Committed", onComplete }) => {
    // Automatically trigger the completion callback after 2 seconds
    useEffect(() => {
        if (onComplete) {
            const timer = setTimeout(onComplete, 2000);
            return () => clearTimeout(timer);
        }
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-10 animate-in fade-in zoom-in duration-500">
            
            {/* ✅ Holographic Checkmark Ring */}
            <div className="relative flex items-center justify-center">
                {/* Static Outer Ring */}
                <div className="w-20 h-20 rounded-full border-2 border-green-500/30" />
                
                {/* Expanding Pulse Ring */}
                <div className="absolute w-20 h-20 rounded-full border-2 border-green-500 animate-ping opacity-20" />
                
                {/* Core Success Icon */}
                <div className="absolute w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_#22c55e]">
                    <IoMdCheckmark className="text-white text-2xl" />
                </div>
                
                {/* Floating Particles (CSS Only) */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
            </div>

            {/* Success Metadata */}
            <div className="text-center space-y-1">
                <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.6em]">
                    Success
                </p>
                <p className="text-sm text-white font-medium tracking-tight">
                    {text}
                </p>
            </div>

            {/* Signal Confirmation Tag */}
            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                <span className="text-[8px] font-mono text-green-500/60 uppercase tracking-widest">
                    DB_WRITE_CONFIRMED // 200 OK
                </span>
            </div>
        </div>
    );
};

export default SuccessCheck;