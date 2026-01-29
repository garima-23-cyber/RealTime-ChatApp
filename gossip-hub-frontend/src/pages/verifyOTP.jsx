import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, sendOtp } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify"; 
import { IoMdUnlock, IoMdRefresh, IoMdArrowBack } from "react-icons/io";
import { HiOutlineShieldCheck } from "react-icons/hi";

const VerifyOtp = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) navigate("/signup");
    }, [email, navigate]);

    // ✅ Toastify Promise for Resending OTP
    const handleResendOtp = async () => {
        const resendPromise = sendOtp(email);

        toast.promise(resendPromise, {
            pending: "Routing new authentication code...",
            success: "New OTP delivered to your inbox ✨",
            error: "Failed to resend code. Try again later. ❌",
        });
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length < 6) return toast.warning("Please enter full 6-digit code");
        
        setLoading(true);
        const verifyPromise = verifyOtp({ email, otp });

        // ✅ Toastify Promise for Verification
        toast.promise(verifyPromise, {
            pending: "Authenticating secure token...",
            success: "Identity verified! Syncing session...",
            error: {
                render({ data }) {
                    // Accesses the error message from your Axios response
                    return data.response?.data?.message || "Verification failed";
                }
            }
        });

        try {
            const res = await verifyPromise;
            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                setUser(res.data.user);
                navigate("/chats");
            }
        } catch (err) {
            setOtp("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] font-inter px-4 relative overflow-hidden perspective-1000">
            {/* ... Your 3D Background Elements stay the same ... */}
            <div className="absolute w-[800px] h-[800px] bg-syncra-pink/10 rounded-full blur-[150px] -top-40 -left-40 animate-pulse" />
            <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -bottom-40 -right-40" />
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700">
                <div className="group relative bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-3xl border border-white/10 p-10 rounded-[3.5rem] shadow-glass-surface transition-transform duration-500 hover:rotate-x-2 hover:rotate-y-2 ring-1 ring-white/5 overflow-hidden">
                    
                    <button 
                        onClick={() => navigate("/signup")}
                        className="absolute top-8 left-8 p-2 rounded-xl bg-white/5 border border-white/5 text-syncra-silver/40 hover:text-syncra-pink hover:bg-syncra-pink/10 transition-all z-20"
                    >
                        <IoMdArrowBack size={20} />
                    </button>

                    <div className="text-center mt-6">
                        <div className="relative mx-auto w-20 h-20 mb-8">
                            <div className="absolute inset-0 bg-syncra-pink/20 blur-xl rounded-full animate-pulse" />
                            <div className="relative w-full h-full bg-syncra-dark border-2 border-syncra-pink/30 rounded-3xl flex items-center justify-center shadow-neon-pink transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <HiOutlineShieldCheck className="text-syncra-pink text-4xl" />
                            </div>
                        </div>
                        
                        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
                            Node <span className="text-syncra-pink">Auth</span>
                        </h2>
                        <p className="text-zinc-500 text-[9px] uppercase tracking-[0.4em] font-black mt-4 px-6 leading-relaxed">
                            Awaiting Signal Verification for {email}
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="flex flex-col gap-10 mt-10">
                        <div className="space-y-4">
                            <label className="text-[9px] uppercase font-black tracking-[0.5em] text-zinc-600 text-center block">
                                Decryption Key
                            </label>
                            
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    maxLength="6"
                                    className="w-full bg-black/40 border-b-2 border-white/5 py-6 text-center text-4xl font-mono tracking-[0.8em] text-white focus:outline-none focus:border-syncra-pink focus:bg-syncra-pink/5 transition-all placeholder:text-zinc-800 shadow-inner rounded-2xl"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || otp.length < 6}
                            className="group relative w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] overflow-hidden transition-all hover:bg-syncra-pink hover:text-white active:scale-95 shadow-glass-sm hover:shadow-neon-pink disabled:opacity-20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-syncra-pink to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black animate-spin rounded-full" />
                                ) : (
                                    <>
                                        <IoMdUnlock className="text-lg group-hover:rotate-12 transition-transform" />
                                        Commit Key
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <button 
                            onClick={handleResendOtp} 
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-syncra-silver/40 hover:text-syncra-pink transition-all group"
                        >
                            <IoMdRefresh className="group-hover:rotate-180 transition-transform duration-700" />
                            Request New Signal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;