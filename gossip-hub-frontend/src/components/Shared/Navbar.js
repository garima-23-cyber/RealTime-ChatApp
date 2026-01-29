import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import logo1 from "../../assets/Logo/logo1.png";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import LogoutModal from "../common/LogoutModal"; 
import { IoMdNotifications, IoMdPower } from "react-icons/io"; 
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 w-full flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-3xl border-b border-white/5 font-inter text-gray-200 shadow-glass-surface z-[100] perspective-1000">
      
      {/* 1. Brand Section (3D Hologram Effect) */}
      <div 
        onClick={() => navigate("/chats")}
        className="flex items-center gap-4 cursor-pointer group preserve-3d"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-syncra-pink/20 blur-2xl rounded-full group-hover:bg-syncra-pink/40 transition-all duration-700 animate-pulse-slow"></div>
          <img 
            src={logo1} 
            className="w-10 h-10 object-contain brightness-125 transition-all duration-1000 group-hover:rotate-[360deg] group-hover:scale-110 relative z-10" 
            alt="Syncra Logo" 
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
            Syncra<span className="text-syncra-pink group-hover:animate-pulse">.</span>
          </h2>
          <span className="text-[7px] font-mono uppercase tracking-[0.5em] text-zinc-600 mt-1">
            Kernel v.1.0.4 // Ready
          </span>
        </div>
      </div>

      {/* 2. Navigation Actions */}
      <div className="flex items-center gap-6">
        
        {/* Notifications Hub */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-2xl transition-all duration-500 flex items-center justify-center group border ${
              showNotifications 
              ? "bg-syncra-pink/10 border-syncra-pink shadow-neon-pink text-syncra-pink" 
              : "bg-white/[0.03] border-white/5 text-syncra-silver/40 hover:border-syncra-pink/40"
            }`}
          >
            <IoMdNotifications className="text-xl group-active:scale-90 transition-transform" />
            
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-syncra-pink opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-syncra-pink border-2 border-[#050505] text-[8px] font-black items-center justify-center text-white">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-[120%] animate-in fade-in slide-in-from-top-2 duration-300">
                <NotificationDropdown />
            </div>
          )}
        </div>

        {/* 3D User Identity Badge */}
        <div 
            onClick={() => navigate("/settings")}
            className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-[1.2rem] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group rim-light"
        >
          <div className="relative">
            <img 
              src={user?.image || "https://api.dicebear.com/7.x/avataaars/svg"} 
              className="w-8 h-8 rounded-xl object-cover border border-white/10 group-hover:shadow-neon-pink transition-all duration-500"
              alt="Profile"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest leading-none mb-1 group-hover:text-syncra-pink/60 transition-colors">Authenticated</span>
            <span className="font-black text-xs tracking-tighter text-white uppercase italic">
              {user?.username || "Agent"}
            </span>
          </div>
        </div>

        {/* 3D Terminate Button */}
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className="p-3 bg-red-500/5 border border-red-500/10 text-red-500/40 rounded-2xl transition-all duration-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 active:scale-90 group"
        >
          <IoMdPower className="text-xl group-hover:rotate-90 transition-transform duration-700" />
        </button>
      </div>

      
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogoutConfirm} 
      />
    </nav>
  );
};

export default Navbar;