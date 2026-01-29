import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutModal from "../components/common/LogoutModal";
import ProfileSettings from "../components/PROFILE/ProfileSetting";
import { IoMdArrowBack, IoMdPower } from "react-icons/io";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        // ✅ Set to bg-transparent/10 so the global ParallaxBackground is visible behind
        <div className="min-h-screen bg-black/10 backdrop-blur-[2px] flex flex-col font-inter perspective-1000">
            
            {/* 🛡️ 3D Floating Header */}
            <header className="sticky top-0 z-40 px-6 md:px-12 py-6 bg-white/[0.01] border-b border-white/5 backdrop-blur-2xl flex items-center justify-between shadow-glass-sm">
                <button 
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 text-syncra-silver/40 hover:text-white transition-all"
                >
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-syncra-pink/30 group-hover:bg-syncra-pink/5 transition-all shadow-inner">
                        <IoMdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit Terminal</span>
                        <span className="text-[7px] font-mono text-zinc-600 mt-1 italic">Return_to_Comms</span>
                    </div>
                </button>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end leading-none mr-4">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Node Configuration</span>
                        <span className="text-[7px] text-zinc-600 mt-1 font-mono">System_Auth_v2.0</span>
                    </div>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500 shadow-lg shadow-red-900/10 active:scale-95"
                    >
                        <IoMdPower className="text-lg group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Terminate</span>
                    </button>
                </div>
            </header>

            {/* 🌌 Main 3D Container */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                {/* Subtle Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                
                <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="transform-gpu">
                         <ProfileSettings />
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="py-20 flex flex-col items-center justify-center opacity-[0.03] select-none">
                    <h1 className="text-[12vw] font-black tracking-tighter uppercase leading-none">Syncra</h1>
                    <p className="text-sm font-mono tracking-[1em] uppercase">Engine Architecture</p>
                </div>
            </main>

            {/* ✅ High-Z Modal */}
            <LogoutModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={handleLogout} 
            />
        </div>
    );
};

export default ProfilePage;