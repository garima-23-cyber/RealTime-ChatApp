import React from "react";
import { IoMdPower, IoMdClose } from "react-icons/io";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* 🌑 Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            {/* 🛡️ Modal Card */}
            <div className="relative w-full max-w-sm bg-[#0D1117] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors"
                >
                    <IoMdClose size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Warning Icon */}
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <IoMdPower className="text-red-500 text-3xl" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                            Terminate Session?
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] leading-relaxed px-4">
                            Your node identity will be disconnected from the Syncra Network.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col w-full gap-3 mt-4">
                        <button 
                            onClick={onConfirm}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-lg shadow-red-900/20 active:scale-95"
                        >
                            Confirm De-auth
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all border border-white/5"
                        >
                            Abort
                        </button>
                    </div>
                </div>

                {/* Decorative Tech Tag */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-widest">
                        auth_token_purge_protocol // v.1.0
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;