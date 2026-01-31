import React from "react";
import { 
    IoMdMic, 
    IoMdDownload, 
    IoMdDocument,
    IoMdAlert
} from "react-icons/io";
import { FiExternalLink } from "react-icons/fi";

const MediaRenderer = ({ type, url, fileName, duration }) => {
    
    // 🌌 1. 3D Skeleton Loader
    if (!url) return (
        <div className="flex items-center gap-4 animate-pulse bg-white/[0.02] p-5 rounded-[2rem] border border-white/5 w-72 glass-3d">
            <div className="w-14 h-14 bg-white/5 rounded-2xl rim-light" />
            <div className="flex flex-col gap-3 flex-1">
                <div className="h-2.5 bg-white/5 rounded-full w-3/4" />
                <div className="h-1.5 bg-white/5 rounded-full w-1/2" />
            </div>
        </div>
    );

    const commonWrapperStyles = "relative group overflow-hidden rounded-[2.2rem] border border-white/10 bg-black/20 backdrop-blur-3xl shadow-glass-surface transition-all duration-500 hover:shadow-neon-pink preserve-3d hover:-translate-z-2";

    switch (type) {
        case "image":
            return (
                <div className={`${commonWrapperStyles} max-w-sm group/img`}>
                    {/* Specular Flare Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-syncra-pink/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <img 
                        src={url} 
                        alt="Target Data" 
                        crossOrigin="anonymous" 
                        loading="lazy"
                        className="w-full h-auto transition-transform duration-700 group-hover/img:scale-105"
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-all duration-500 cursor-pointer">
                        <div className="flex flex-col items-center gap-3 transform translate-y-4 group-hover/img:translate-y-0 transition-transform">
                            <FiExternalLink className="text-syncra-pink text-3xl animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/60">Open_Source_File</span>
                        </div>
                    </div>
                </div>
            );

        case "voice":
            return (
                <div className="flex flex-col gap-3 min-w-[300px] p-5 rounded-[2rem] glass-3d rim-light transition-all duration-500 hover:shadow-neon-pink">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-syncra-pink shadow-neon-pink border border-white/20 transform -rotate-6 hover:rotate-0 transition-transform">
                            <IoMdMic className="text-white text-2xl" />
                        </div>
                        <div className="flex-1">
                            {/* Themed Audio Bar */}
                            <audio 
                                src={url} 
                                controls 
                                className="h-8 w-full filter invert hue-rotate-180 brightness-200 contrast-150 scale-95"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center px-2 mt-1">
                        <div className="flex flex-col">
                            <span className="text-[7px] text-zinc-500 font-black uppercase tracking-[0.4em]">Audio_Transmission</span>
                            <span className="text-[9px] text-zinc-300 font-mono mt-1 italic">ENCRYPTED_VOICE_PACKET</span>
                        </div>
                        {duration && (
                            <div className="px-3 py-1 bg-syncra-pink/10 rounded-lg border border-syncra-pink/20">
                                <span className="text-[10px] text-syncra-pink font-mono font-black">
                                    {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}s
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );

        case "video":
            return (
                <div className={`${commonWrapperStyles} max-w-md group/vid shadow-2xl`}>
                    <video 
                        src={url} 
                        controls 
                        playsInline 
                        preload="metadata"
                        className="w-full max-h-[450px] transition-opacity group-hover/vid:opacity-80"
                    />
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl px-4 py-1.5 rounded-2xl text-[8px] text-white flex items-center gap-3 border border-white/10 opacity-0 group-hover/vid:opacity-100 transition-all shadow-2xl translate-x-4 group-hover/vid:translate-x-0">
                        <div className="w-1.5 h-1.5 bg-syncra-pink rounded-full animate-ping" />
                        <span className="font-black tracking-[0.4em] uppercase">Visual_Stream_Live</span>
                    </div>
                </div>
            );

        case "file":
            return (
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-5 p-5 rounded-[2rem] glass-3d rim-light hover:bg-white/[0.05] transition-all group/file shadow-2xl max-w-xs preserve-3d"
                >
                    <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-3xl bg-white/5 text-zinc-600 group-hover/file:bg-syncra-pink group-hover/file:text-white group-hover/file:shadow-neon-pink group-hover/file:-rotate-6 transition-all duration-500">
                        <IoMdDocument />
                    </div>
                    <div className="flex flex-col overflow-hidden gap-1">
                        <span className="text-xs font-black text-white truncate tracking-tight uppercase italic">
                            {fileName || "Secure_Doc_Node"}
                        </span>
                        <div className="flex items-center gap-2 group-hover/file:translate-x-1 transition-transform">
                            <span className="text-[9px] text-syncra-pink font-black uppercase tracking-widest">
                                Downlink
                            </span>
                            <IoMdDownload className="text-syncra-pink text-xs animate-bounce" />
                        </div>
                    </div>
                </a>
            );

        default:
            return (
                <div className="flex items-center gap-4 p-5 bg-red-500/5 border border-red-500/20 rounded-[1.5rem] text-red-400 glass-3d ring-1 ring-red-500/10">
                    <IoMdAlert className="text-2xl animate-pulse" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Unknown_Protocol</span>
                        <a href={url} target="_blank" rel="noreferrer"  className="text-[8px] font-mono underline opacity-50 hover:opacity-100">Access_Direct_Source</a>
                    </div>
                </div>
            );
    }
};

export default MediaRenderer;