import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "./components/Splash/SplashScreen";

// Pages & Components
import Login from "./pages/login";
import Signup from "./pages/signup";
import VerifyOtp from "./pages/verifyOTP";
import ChatPage from "./pages/chatPage";
import PrivateRoute from "./components/Shared/PrivateRoute";
import Navbar from "./components/Shared/Navbar";
import ProfilePage from "./pages/profilePage";

// Contexts & Parallax
import { useAuth } from "./context/AuthContext";
import CallModal from "./components/Calling/CallModal";
import ParallaxBackground from "./components/Shared/ParallaxBackground";

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      // Simulate system boot
      await new Promise(resolve => setTimeout(resolve, 2500));
      setIsBooting(false);
    };
    initializeApp();
  }, []);

  return (
    <>
      {(isBooting || authLoading) ? (
        <SplashScreen />
      ) : (
        <Router>
          <div className="site-reveal min-h-screen bg-[#0B0E14] font-inter text-gray-200 overflow-hidden">
            <ParallaxBackground />
            <Navbar />
            <CallModal />
            
            <main className="relative h-[calc(100vh-73px)] w-full overflow-hidden">
              <Routes>
                <Route path="/login" element={!token ? <Login /> : <Navigate to="/chats" />} />
                <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/chats" />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                
                <Route path="/chats" element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                } />

                <Route path="/settings" element={
                  <PrivateRoute>
                    <div className="h-full overflow-y-auto custom-scrollbar bg-[#050505]">
                       <ProfilePage />
                    </div>
                  </PrivateRoute>
                } />

                <Route path="/" element={<Navigate to="/chats" />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </main>
          </div>
        </Router>
      )}
    </>
  );
}

export default App;