import React, { useState, useEffect } from "react";
import { signup } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ Switched to Toastify
import { 
    IoMdPerson, 
    IoMdMail, 
    IoMdLock, 
    IoMdEye, 
    IoMdEyeOff, 
    IoMdFingerPrint 
} from "react-icons/io";

const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 40,
                y: (e.clientY / window.innerHeight - 0.5) * 40,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validations
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Shield Keys do not match!");
        }
        if (formData.password.length < 8) {
            return toast.warning("Security key must be at least 8 characters");
        }

        setLoading(true);
        const signupPromise = signup(formData);

        // ✅ React Toastify Promise Implementation
        toast.promise(signupPromise, {
            pending: "Generating identity and routing OTP...",
            success: "Verification code sent to your email! 📨",
            error: {
                render({ data }) {
                    // Extracting message from Axios error
                    return data.response?.data?.message || "Registration protocol failed";
                }
            },
        });

        try {
            const res = await signupPromise;
            if (res.data.success) {
                // Tactical delay to let user see success toast
                setTimeout(() => {
                    navigate("/verify-otp", { state: { email: formData.email } });
                }, 1000);
            }
        } catch (error) {
            console.error("Signup Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] font-inter px-4 relative overflow-hidden perspective-1000">
            
            {/* 🌌 Background Parallax Layers (Kept your existing logic) */}
            <div 
                className="absolute w-[1000px] h-[1000px] bg-syncra-pink/5 rounded-full blur-[150px] transition-transform duration-1000 ease-out"
                style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
            />
            <div 
                className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] transition-transform duration-700 ease-out"
                style={{ transform: `translate(${mousePos.x * -1.2}px, ${mousePos.y * -1.2}px)` }}
            />
            <div 
                className="absolute inset-0 pointer-events-none opacity-30 transition-transform duration-300 ease-out bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
                style={{ transform: `scale(1.1) translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}
            />

            {/* 🛡️ THE SIGNUP CARD */}
            <div className="w-full max-w-lg z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <form 
                    onSubmit={handleSubmit}
                    style={{ 
                        transform: `rotateX(${mousePos.y * -0.1}deg) rotateY(${mousePos.x * 0.1}deg)`,
                        transition: 'transform 0.2s ease-out'
                    }}
                    className="bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[3.5rem] shadow-glass-surface flex flex-col gap-6 relative ring-1 ring-white/5"
                >
                    <div className="mx-auto w-20 h-20 bg-syncra-dark border-2 border-syncra-pink/30 rounded-3xl flex items-center justify-center mb-4 shadow-neon-pink transform rotate-6 hover:rotate-0 transition-transform duration-500">
                        <IoMdFingerPrint className="text-syncra-pink text-5xl" />
                    </div>

                    <div className="text-center">
                        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                            Join <span className="text-syncra-pink">Syncra</span>
                        </h2>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-black mt-3">
                            Initialize Secure Node Identity
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {[
                            { label: "Identity Name", name: "username", icon: <IoMdPerson />, type: "text", ph: "syncra_agent", span: "md:col-span-2" },
                            { label: "Secure Email", name: "email", icon: <IoMdMail />, type: "email", ph: "vault@syncra.io", span: "md:col-span-2" }
                        ].map((field) => (
                            <div key={field.name} className={`group flex flex-col gap-2 ${field.span}`}>
                                <label className="text-[9px] uppercase font-black tracking-[0.2em] text-zinc-600 group-focus-within:text-syncra-pink transition-colors flex items-center gap-2 px-1">
                                    {field.icon} {field.label}
                                </label>
                                <input 
                                    type={field.type} 
                                    placeholder={field.ph}
                                    required 
                                    className="w-full bg-white/[0.02] border-b border-white/10 px-1 py-3 text-sm text-white focus:outline-none focus:border-syncra-pink transition-all placeholder:text-zinc-800"
                                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})} 
                                />
                            </div>
                        ))}

                        {/* Password Fields */}
                        <div className="group flex flex-col gap-2">
                            <label className="text-[9px] uppercase font-black tracking-[0.2em] text-zinc-600 group-focus-within:text-syncra-pink transition-colors flex items-center gap-2 px-1">
                                <IoMdLock /> Shield Key
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    required 
                                    className="w-full bg-white/[0.02] border-b border-white/10 px-1 py-3 text-sm text-white focus:outline-none focus:border-syncra-pink transition-all placeholder:text-zinc-800"
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-syncra-pink transition-colors"
                                >
                                    {showPassword ? <IoMdEyeOff size={16} /> : <IoMdEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="group flex flex-col gap-2">
                            <label className="text-[9px] uppercase font-black tracking-[0.2em] text-zinc-600 group-focus-within:text-syncra-pink transition-colors flex items-center gap-2 px-1">
                                <IoMdLock /> Verify Key
                            </label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                required 
                                className="w-full bg-white/[0.02] border-b border-white/10 px-1 py-3 text-sm text-white focus:outline-none focus:border-syncra-pink transition-all placeholder:text-zinc-800"
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="group relative w-full mt-8 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] py-5 rounded-full overflow-hidden transition-all hover:bg-syncra-pink hover:text-white active:scale-95 shadow-glass-sm hover:shadow-neon-pink"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-syncra-pink to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative z-10">
                            {loading ? "INITIALIZING..." : "Authorize Identity"}
                        </span>
                    </button>

                    <p className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-4">
                        Existing Node?{" "}
                        <Link to="/login" className="text-white hover:text-syncra-pink transition-colors">
                            Access Terminal
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;