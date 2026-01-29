import React, { useState, useEffect } from "react";

const ParallaxBackground = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Calculates displacement from center (-20 to 20 range)
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 40,
                y: (e.clientY / window.innerHeight - 0.5) * 40,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#050505] -z-50">
            {/* 🔴 Layer 1: Large Pink Nebula (Moves slow) */}
            <div 
                className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-syncra-pink/10 blur-[120px] transition-transform duration-1000 ease-out"
                style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
            />

            {/* 🔵 Layer 2: Deep Blue Pulse (Moves opposite) */}
            <div 
                className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/5 blur-[100px] transition-transform duration-700 ease-out"
                style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
            />

            {/* ⚪ Layer 3: Floating 3D Rings */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full opacity-20"
                style={{ 
                    transform: `translate(-50%, -50%) translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px) rotateX(${mousePos.y * 0.2}deg) rotateY(${mousePos.x * 0.2}deg)` 
                }}
            >
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-syncra-pink rounded-full shadow-neon-pink shadow-lg" />
            </div>

            {/* ✨ Layer 4: Static Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15]" />
        </div>
    );
};

export default ParallaxBackground;