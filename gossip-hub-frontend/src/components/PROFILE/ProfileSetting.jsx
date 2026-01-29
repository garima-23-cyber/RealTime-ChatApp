import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, getUserDetails } from "../../api/profileAPI";
import ImageUpdater from "./ImageUpdater";
import ProfileHeader from "./ProfileHeader";
import Loader from "../common/loader";
import SuccessCheck from "../common/SuccessCheck";
import { IoMdFingerPrint, IoMdRocket, IoMdPulse } from "react-icons/io";
import { toast } from "react-toastify"; // ✅ Standardizing with your new Toastify setup

const ProfileSettings = () => {
    const { user, setUser } = useAuth();
    const [status, setStatus] = useState("idle");
    const [formData, setFormData] = useState({
        username: user?.username || "",
        about: user?.additionalDetails?.about || "",
        gender: user?.additionalDetails?.gender || "",
        contactNumber: user?.additionalDetails?.contactNumber || "",
        dateOfBirth: user?.additionalDetails?.dateOfBirth || "",
    });

    // 1. Core Metadata Synchronization
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const { data } = await getUserDetails();
                const latestUser = data.data;
                setFormData({
                    username: latestUser.username,
                    about: latestUser.additionalDetails?.about || "",
                    gender: latestUser.additionalDetails?.gender || "",
                    contactNumber: latestUser.additionalDetails?.contactNumber || "",
                    // ✅ Safely handle ISO date to HTML date format
                    dateOfBirth: latestUser.additionalDetails?.dateOfBirth 
                        ? new Date(latestUser.additionalDetails.dateOfBirth).toISOString().split('T')[0] 
                        : "",
                });
            } catch (err) { 
                console.error("METADATA_LOAD_ERROR:", err); 
            }
        };
        fetchLatest();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // 2. Commit Identity Logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        
        const updatePromise = updateProfile(formData);

        toast.promise(updatePromise, {
            pending: "Uploading Identity Fragments...",
            success: "Matrix Synchronized ✨",
            error: "PROTOCOL_ERROR: Handshake Failed ❌",
        });

        try {
            const { data } = await updatePromise;
            setUser(data.data);
            localStorage.setItem("user", JSON.stringify(data.data));
            setStatus("success");
        } catch (error) {
            setStatus("idle");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-10 space-y-12 pb-32 custom-scrollbar perspective-1000">
            <ProfileHeader />

            <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                
                {/* 📟 IDENTITY COLUMN */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-2 overflow-hidden backdrop-blur-md shadow-glass-sm hover:shadow-neon-pink transition-all duration-500">
                        <ImageUpdater />
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-md glass-3d">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-syncra-pink mb-4 flex items-center gap-2">
                            <IoMdPulse className="animate-pulse" /> Identity Bio
                        </h4>
                        <textarea 
                            name="about" 
                            value={formData.about} 
                            onChange={handleChange}
                            placeholder="Data fragment about node..."
                            className="w-full bg-transparent text-sm text-zinc-400 outline-none resize-none h-40 custom-scrollbar placeholder:text-zinc-800 leading-relaxed"
                        />
                    </div>
                </div>

                {/* 🖥️ DATA MATRIX */}
                <form onSubmit={handleSubmit} className="col-span-12 lg:col-span-8 space-y-6 preserve-3d">
                    <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 lg:p-12 backdrop-blur-2xl relative overflow-hidden group rim-light shadow-glass-surface">
                        
                        {/* Specular Identity Glyph */}
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none">
                            <IoMdFingerPrint size={180} className="text-syncra-pink" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
                            {[
                                { label: "Node Alias", name: "username", type: "text", ph: "Ghost_User" },
                                { label: "Comm Protocol", name: "contactNumber", type: "text", ph: "+1 000 000" },
                                { label: "Origin Date", name: "dateOfBirth", type: "date", ph: "" },
                                { label: "Identity Class", name: "gender", type: "select" },
                            ].map((field) => (
                                <div key={field.name} className="flex flex-col gap-3 group/field">
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 group-focus-within/field:text-syncra-pink transition-colors">
                                        {field.label}
                                    </label>
                                    
                                    {field.type === "select" ? (
                                        <select 
                                            name={field.name} value={formData[field.name]} onChange={handleChange}
                                            className="bg-transparent border-b border-white/10 py-2 text-sm text-white focus:border-syncra-pink outline-none transition-all cursor-pointer appearance-none [color-scheme:dark]"
                                        >
                                            <option value="" className="bg-[#0B0E14]">Unspecified</option>
                                            <option value="Male" className="bg-[#0B0E14]">Male</option>
                                            <option value="Female" className="bg-[#0B0E14]">Female</option>
                                            <option value="Non-Binary" className="bg-[#0B0E14]">Non-Binary</option>
                                        </select>
                                    ) : (
                                        <input 
                                            type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange}
                                            placeholder={field.ph}
                                            className="bg-transparent border-b border-white/10 py-2 text-sm text-white focus:border-syncra-pink outline-none transition-all placeholder:text-zinc-800 [color-scheme:dark]"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 flex justify-end">
                            <button 
                                type="submit"
                                disabled={status === "loading"}
                                className="group relative flex items-center gap-3 bg-white text-black px-12 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-syncra-pink hover:text-white transition-all duration-500 shadow-xl active:scale-95 disabled:opacity-50"
                            >
                                <IoMdRocket className="text-lg group-hover:-translate-y-1 transition-transform" />
                                <span>Commit to Matrix</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Overlays */}
            {status === "loading" && <Loader fullScreen={true} text="Rewriting Core Identity" />}
            {status === "success" && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center">
                    <SuccessCheck text="Metadata Synced" onComplete={() => setStatus("idle")} />
                </div>
            )}
        </div>
    );
};

export default ProfileSettings;