import React from "react";
import { useAuth } from "../../context/AuthContext";
import { IoMdCheckmarkCircle, IoMdGlobe, IoMdCalendar } from "react-icons/io";

const ProfileHeader = () => {
    const { user } = useAuth();

    // Formatting join date with a fallback
    const joinDate = user?.createdAt 
        ? new Date(user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' }) 
        : "Initial Epoch";

    return (
        <div className="relative w-full mb-10 overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-3xl shadow-2xl">
            
            {/* ✅ Dynamic Cyber-Banner Overlay */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-syncra-pink/20 via-transparent to-blue-600/10 opacity-40" />
            
            {/* Grid Pattern Background for a technical feel */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

            <div className="relative px-8 pt-20 pb-10 flex flex-col md:flex-row items-center md:items-end gap-8">
                
                {/* 1. Identity Core (Avatar) */}
                <div className="relative group shrink-0">
                    <div className="w-36 h-36 rounded-full border-4 border-[#0B0E14] overflow-hidden shadow-[0_0_50px_rgba(255,45,85,0.25)] transition-transform duration-500 group-hover:scale-105">
                        <img 
                            src={user?.image} 
                            alt="Identity Core" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    {/* Status Glow: Pulsing Green for Online */}
                    <div className="absolute bottom-3 right-3 w-7 h-7 bg-green-500 rounded-full border-4 border-[#0B0E14] shadow-[0_0_20px_#22c55e] animate-pulse" />
                    
                    {/* Level/Rank Badge (Aesthetic Addition) */}
                    <div className="absolute -top-1 -left-1 bg-syncra-pink text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                        Node v.1
                    </div>
                </div>

                {/* 2. Identity Metadata */}
                <div className="flex-1 space-y-3 pb-2 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                            {user?.username}
                        </h1>
                        <div className="flex items-center gap-1 bg-syncra-pink/10 border border-syncra-pink/20 px-2 py-1 rounded-md">
                            <IoMdCheckmarkCircle className="text-syncra-pink text-sm" />
                            <span className="text-[8px] text-syncra-pink font-black uppercase tracking-widest">Verified</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-syncra-silver/40">
                        <div className="flex items-center gap-2 group/meta">
                            <IoMdGlobe className="text-sm group-hover/meta:text-syncra-pink transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                                UID: {user?._id?.slice(-8).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 group/meta">
                            <IoMdCalendar className="text-sm group-hover/meta:text-syncra-pink transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                                Established: {joinDate}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Account Tier Badge */}
                <div className="pb-2">
                    <div className="px-8 py-3 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md group hover:border-syncra-pink/30 transition-all duration-300">
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.5em] mb-1.5 group-hover:text-syncra-pink/50">Access Protocol</p>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-syncra-pink rounded-full animate-ping" />
                            <span className="text-white font-mono text-xs font-bold tracking-[0.1em]">
                                {user?.accountType === "Admin" ? "ROOT_ACCESS" : "STANDARD_NODE"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;