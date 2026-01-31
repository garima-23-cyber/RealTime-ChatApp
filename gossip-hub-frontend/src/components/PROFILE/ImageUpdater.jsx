import React, { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateDisplayPicture, deleteDisplayPicture } from "../../api/profileAPI";
import { IoMdCamera, IoMdTrash } from "react-icons/io";
import { toast } from "react-toastify"; // ✅ Switched to Toastify
import Loader from "../common/loader"; 
import SuccessCheck from "../common/SuccessCheck"; 

const ImageUpdater = () => {
    const { user, setUser } = useAuth();
    const [status, setStatus] = useState("idle"); 
    const fileInputRef = useRef(null);

    // ✅ 1. Handle File Selection & Upload (The Data Handshake)
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Constraint: Packet size restricted to 2MB
        if (file.size > 2 * 1024 * 1024) {
            return toast.warning("SIGNAL_ERROR: Packet limit exceeded (2MB)");
        }

        const formData = new FormData();
        formData.append("displayPicture", file);

        setStatus("loading");
        
        const uploadPromise = updateDisplayPicture(formData);

        toast.promise(uploadPromise, {
            pending: "Uploading Identity Fragments...",
            success: "Identity Synced Successfully ✨",
            error: "UPLOAD_PROTOCOL_FAILURE: Handshake Interrupted ❌",
        });

        try {
            const { data } = await uploadPromise;
            setUser(data.data);
            localStorage.setItem("user", JSON.stringify(data.data));
            setStatus("success");
        } catch (error) {
            setStatus("idle");
        }
    };

    // ✅ 2. Handle Image Purge (The Matrix Reset)
    const handlePurge = async () => {
        if (!window.confirm("Purge this identity image from the matrix?")) return;

        setStatus("loading");
        const purgePromise = deleteDisplayPicture();

        toast.promise(purgePromise, {
            pending: "Executing Purge Sequence...",
            success: "Identity Neutralized ⚡",
            error: "PURGE_FAILURE: File is locked or missing",
        });

        try {
            const { data } = await purgePromise;
            setUser(data.data);
            localStorage.setItem("user", JSON.stringify(data.data));
            setStatus("success");
        } catch (error) {
            setStatus("idle");
        }
    };

    const isDefault = user?.image?.includes("ui-avatars.com");

    return (
        <div className="flex flex-col items-center justify-center min-h-[350px] p-8 bg-white/[0.01] border border-white/5 rounded-[3.5rem] backdrop-blur-3xl shadow-glass-surface relative overflow-hidden perspective-1000 group/container">
            
            {/* 🎞️ Subtle Scanline Overlay */}
            <div className="absolute inset-0 scanline opacity-[0.03] pointer-events-none" />

            {/* --- STATE: LOADING --- */}
            {status === "loading" && <Loader text="Rewriting Metadata" />}

            {/* --- STATE: SUCCESS --- */}
            {status === "success" && (
                <SuccessCheck 
                    text="Handshake Complete" 
                    onComplete={() => setStatus("idle")} 
                />
            )}

            {/* --- STATE: IDLE (Standard View) --- */}
            {status === "idle" && (
                <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700 preserve-3d">
                    
                    <div className="relative group/avatar transition-transform duration-500 hover:-translate-z-2">
                        
                        {/* 🛡️ 3D Profile Image Node */}
                        <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-white/5 group-hover/avatar:border-syncra-pink/50 transition-all duration-700 shadow-glass-surface p-1 bg-syncra-dark">
                            <img 
                                src={user?.image} 
                                alt="Identity Node" 
                                className="w-full h-full rounded-2xl object-cover grayscale-[20%] group-hover/avatar:grayscale-0 group-hover/avatar:scale-105 transition-all duration-1000"
                            />
                            
                            {/* Tactical HUD Overlay on Hover */}
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-all duration-500"
                            >
                                <div className="p-4 bg-syncra-pink rounded-2xl shadow-neon-pink transform translate-y-4 group-hover/avatar:translate-y-0 transition-transform duration-500">
                                    <IoMdCamera className="text-white text-3xl" />
                                </div>
                                <span className="text-[9px] text-white font-black uppercase tracking-[0.4em] mt-4">Update_Node</span>
                            </div>
                        </div>

                        {/* 🗑️ Purge Action (Floating Component) */}
                        {!isDefault && (
                            <button 
                                onClick={handlePurge}
                                className="absolute -top-3 -right-3 bg-red-600/20 hover:bg-red-600 text-white p-3 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 transition-all duration-500 group-hover/avatar:rotate-12 active:scale-90"
                                title="Terminate Metadata Image"
                            >
                                <IoMdTrash size={18} />
                            </button>
                        )}
                    </div>

                    {/* 📜 Identity Readout */}
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{user?.username}</h3>
                        <div className="mt-2 flex flex-col gap-1 items-center">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/5 rounded-full shadow-inner">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                                <span className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.4em]">
                                    LinkEstablished // ID_{user?._id?.slice(-6).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Input Bridge */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
            />
        </div>
    );
};

export default ImageUpdater;