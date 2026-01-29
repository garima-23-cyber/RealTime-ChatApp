import React, { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { useCallLogic } from "../../hooks/useCallLogic";
import VideoStream from "./VideoStream";
import { IoMdCall, IoMdMic, IoMdMicOff, IoMdVideocam, IoMdPulse } from "react-icons/io";
import { MdCallEnd } from "react-icons/md";

const CallModal = () => {
    const { socket } = useSocket();
    const { user } = useAuth();
    
    const {
        stream, receivingCall, callAccepted, otherUser, isCalling, micActive,
        remoteVideo, startCall, answerCall, handleCleanup, toggleMic,
        setReceivingCall, setOtherUser, setCallerSignal, setCallAccepted, setActiveCallId, dialAudio
    } = useCallLogic(socket, user);

    useEffect(() => {
        window.initiateSyncraCall = (targetId, targetName, type, chatId) => {
            if (!socket?.connected) return;
            startCall(targetId, targetName, type, chatId);
        };
        return () => { delete window.initiateSyncraCall; };
    }, [socket, startCall]);

    useEffect(() => {
        if (!socket) return;

        socket.on("incoming_call", ({ from, name, signal, callType, callId }) => {
            setReceivingCall(true);
            setOtherUser({ id: from, name, callType });
            setCallerSignal(signal);
            setActiveCallId(callId);
        });

        socket.on("call_accepted", (signal) => {
            setCallAccepted(true);
            dialAudio.current.pause(); 
        });

        socket.on("call_ended", () => handleCleanup());

        return () => {
            socket.off("incoming_call");
            socket.off("call_accepted");
            socket.off("call_ended");
        };
    }, [socket, handleCleanup, setReceivingCall, setOtherUser, setCallerSignal, setCallAccepted, setActiveCallId, dialAudio]);

    if (!receivingCall && !callAccepted && !stream && !isCalling) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-[#050505]/95 backdrop-blur-[40px] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 perspective-1000">
            
            {/* 🌌 Background Parallax Flare */}
            <div className="absolute w-[800px] h-[800px] bg-syncra-pink/5 rounded-full blur-[150px] animate-pulse-slow" />

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 h-[65vh] preserve-3d">
                
                {/* 📟 LOCAL NODE (Left) */}
                <div className="relative rounded-[3.5rem] overflow-hidden border border-white/10 bg-black/40 shadow-glass-surface group transition-transform duration-700 hover:rotate-y-6">
                    <div className="absolute top-6 left-8 z-20 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Local_Node // You</span>
                    </div>
                    <VideoStream stream={stream} isLocal={true} username="You" />
                    <div className="absolute inset-0 scanline opacity-[0.05] pointer-events-none" />
                </div>

                {/* 📡 REMOTE NODE (Right) */}
                <div className="relative rounded-[3.5rem] overflow-hidden border border-white/10 bg-black/40 shadow-glass-surface group transition-transform duration-700 hover:-rotate-y-6">
                    <div className="absolute top-6 left-8 z-20 flex items-center gap-2">
                        <IoMdPulse className="text-syncra-pink animate-pulse text-xs" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Remote_Peer // {otherUser.name}</span>
                    </div>

                    {callAccepted ? (
                        otherUser.callType === "video" ? (
                            <video ref={remoteVideo} playsInline autoPlay className="w-full h-full object-cover grayscale-[30%] contrast-125" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-syncra-pink/20 blur-3xl rounded-full animate-pulse" />
                                    <div className="w-28 h-28 rounded-[2rem] bg-syncra-dark border-2 border-syncra-pink/30 flex items-center justify-center shadow-neon-pink">
                                        <IoMdMic className="text-syncra-pink text-5xl" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{otherUser.name}</h3>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-10">
                            <div className="relative">
                                <div className="w-24 h-24 border-b-2 border-r-2 border-syncra-pink animate-spin rounded-full opacity-20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-syncra-pink rounded-full shadow-neon-pink animate-ping" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{otherUser.name}</h3>
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-syncra-pink/10 border border-syncra-pink/20 rounded-full mt-4">
                                    <span className="text-[8px] text-syncra-pink font-black uppercase tracking-[0.4em] animate-pulse">
                                        {receivingCall ? "Establishing Handshake" : "Broadcasting Signal"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 scanline opacity-[0.05] pointer-events-none" />
                </div>
            </div>

            {/* ⌨️ COMMAND DOCK (Controls) */}
            <div className="mt-16 flex items-center gap-10 bg-white/[0.02] p-6 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-glass-surface rim-light transform hover:scale-105 transition-transform duration-500">
                {callAccepted && (
                    <button 
                        onClick={toggleMic} 
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 border ${
                            micActive 
                            ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white' 
                            : 'bg-red-500/20 border-red-500 text-red-500 shadow-neon-pink animate-pulse'
                        }`}
                    >
                        {micActive ? <IoMdMic /> : <IoMdMicOff />}
                    </button>
                )}

                {receivingCall && !callAccepted && (
                    <button 
                        onClick={answerCall} 
                        className="w-24 h-24 rounded-[2rem] bg-green-500 text-white flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:scale-110 active:scale-90 transition-all duration-500 border-2 border-green-400"
                    >
                        {otherUser.callType === "video" ? <IoMdVideocam /> : <IoMdCall />}
                    </button>
                )}

                <button 
                    onClick={() => { socket.emit("end_call", { to: otherUser.id }); handleCleanup(); }} 
                    className="w-24 h-24 rounded-[2rem] bg-red-600 text-white flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(220,38,38,0.3)] hover:scale-110 active:scale-90 transition-all duration-500 border-2 border-red-500"
                >
                    <MdCallEnd />
                </button>
            </div>

            {/* 📜 Telemetry Footer */}
            <div className="absolute bottom-8 text-[8px] font-mono text-zinc-700 uppercase tracking-[0.5em] flex gap-8">
                <span>Signal_Strength: 98%</span>
                <span className="text-syncra-pink">Encryption: P2P_RSA_ACTIVE</span>
                <span>Bitrate: 4.2_MBPS</span>
            </div>
        </div>
    );
};

export default CallModal;