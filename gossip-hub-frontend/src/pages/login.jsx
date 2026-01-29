import React, { useState, useEffect } from "react";
import { login } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify"; // ✅ Switched to Toastify
import { IoMdMail, IoMdLock, IoMdEye, IoMdEyeOff, IoMdFingerPrint } from "react-icons/io";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { setUser } = useAuth();
  const navigate = useNavigate();

  // ✅ Parallax Mouse Tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginPromise = login({ email, password });

    // ✅ React Toastify Promise Implementation
    toast.promise(loginPromise, {
      pending: "Verifying secure node credentials...",
      success: "Access Granted. Syncing Terminal... 🚀",
      error: {
        render({ data }) {
          // data is the Axios error object
          return data.response?.data?.message || "Authorization Denied";
        },
      },
    });

    try {
      const res = await loginPromise;
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        
        // Brief delay to allow the user to see the success toast
        setTimeout(() => {
          navigate("/chats");
        }, 1000);
      }
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] font-inter px-4 relative overflow-hidden perspective-1000">
      
      {/* 🌌 Background Parallax Layers */}
      <div 
        className="absolute w-[800px] h-[800px] bg-syncra-pink/5 rounded-full blur-[150px] transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
      />
      <div 
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
      />

      {/* 🛡️ THE LOGIN CARD */}
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        <form 
          onSubmit={handleSubmit}
          style={{ 
            transform: `rotateX(${mousePos.y * -0.1}deg) rotateY(${mousePos.x * 0.1}deg)`,
            transition: 'transform 0.2s ease-out'
          }}
          className="bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-3xl border border-white/10 p-10 rounded-[3.5rem] shadow-glass-surface flex flex-col gap-8 relative ring-1 ring-white/5"
        >
          {/* Brand Icon */}
          <div className="mx-auto w-20 h-20 bg-syncra-dark border-2 border-syncra-pink/30 rounded-3xl flex items-center justify-center mb-2 shadow-neon-pink transform -rotate-3 hover:rotate-0 transition-transform duration-500">
             <IoMdFingerPrint className="text-syncra-pink text-5xl" />
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              Access <span className="text-syncra-pink">Terminal</span>
            </h2>
            <p className="text-zinc-500 text-[9px] uppercase tracking-[0.4em] font-black mt-3">
              Establish Secure Session
            </p>
          </div>

          <div className="flex flex-col gap-8 mt-2">
            <div className="group flex flex-col gap-3">
              <label className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 group-focus-within:text-syncra-pink transition-colors font-black ml-1">
                <IoMdMail className="inline mr-2 text-sm" /> Node Email
              </label>
              <input 
                type="email" 
                placeholder="agent_identity@syncra.io" 
                required 
                className="w-full bg-white/[0.02] border-b border-white/10 px-1 py-3 text-sm text-white focus:outline-none focus:border-syncra-pink transition-all placeholder:text-zinc-800"
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="group flex flex-col gap-3">
              <label className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 group-focus-within:text-syncra-pink transition-colors font-black ml-1">
                <IoMdLock className="inline mr-2 text-sm" /> Security Key
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  className="w-full bg-white/[0.02] border-b border-white/10 px-1 py-3 text-sm text-white focus:outline-none focus:border-syncra-pink transition-all placeholder:text-zinc-800"
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-syncra-pink transition-colors"
                >
                  {showPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full mt-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] py-5 rounded-full overflow-hidden transition-all hover:bg-syncra-pink hover:text-white active:scale-95 shadow-glass-sm hover:shadow-neon-pink disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-syncra-pink to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "AUTHENTICATING..." : "Establish Connection"}
            </span>
          </button>

          <p className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">
            New Identity?{" "}
            <Link to="/signup" className="text-white hover:text-syncra-pink transition-colors underline-offset-8">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;