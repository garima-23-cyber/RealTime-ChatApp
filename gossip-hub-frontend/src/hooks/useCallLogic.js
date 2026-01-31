import { useState, useRef, useCallback, useEffect } from "react";
import Peer from "simple-peer";
import { toast } from "react-toastify"; 

const iceConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
        ]
    };

export const useCallLogic = (socket, user) => {
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callerSignal, setCallerSignal] = useState(null);
    const [otherUser, setOtherUser] = useState({ id: "", name: "", callType: "video" });
    const [micActive, setMicActive] = useState(true);
    const [isCalling, setIsCalling] = useState(false);
    const [activeCallId, setActiveCallId] = useState(null);

    const remoteVideo = useRef();
    const connectionRef = useRef();
    
    // 🎵 Tactical Audio Management
    const dialAudio = useRef(new Audio("/sounds/dialtone.mp3"));
    const ringAudio = useRef(new Audio("/sounds/ringtone.mp3"));

    useEffect(() => {
        ringAudio.current.loop = true;
        dialAudio.current.loop = true;
    }, []);

    

    const handleCleanup = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (connectionRef.current) {
            connectionRef.current.destroy();
            connectionRef.current = null;
        }
        setStream(null);
        setReceivingCall(false);
        setCallAccepted(false);
        setCallerSignal(null);
        setIsCalling(false);
        setActiveCallId(null);
        
        // 🔇 Global Silence Protocol
        dialAudio.current.pause();
        dialAudio.current.currentTime = 0;
        ringAudio.current.pause();
        ringAudio.current.currentTime = 0;
    }, [stream]);

    const startCall = useCallback((targetId, targetName, type, chatId) => {
        setIsCalling(true);
        setOtherUser({ id: targetId, name: targetName, callType: type });
        dialAudio.current.play().catch(() => console.log("Audio blocked by browser"));

        navigator.mediaDevices.getUserMedia({ 
            video: type === "video" ? { width: 1280, height: 720 } : false, 
            audio: true 
        })
        .then((currentStream) => {
            setStream(currentStream);
            const peer = new Peer({ 
                initiator: true, 
                trickle: false, 
                stream: currentStream, 
                config: iceConfig 
            });

            peer.on("signal", (data) => {
                socket.emit("call_user", {
                    userToCall: targetId,
                    signalData: data,
                    from: (user.id || user._id).toString(),
                    name: user.username,
                    callType: type,
                    chatId: chatId
                });
            });

            peer.on("stream", (remoteStream) => {
                if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
            });

            connectionRef.current = peer;
        }).catch((err) => {
            toast.error("HARDWARE_FAILURE: Camera/Mic Access Denied");
            handleCleanup();
        });
    }, [socket, user, handleCleanup]);

    const answerCall = useCallback(() => {
        setCallAccepted(true);
        setReceivingCall(false);
        ringAudio.current.pause();

        navigator.mediaDevices.getUserMedia({ 
            video: otherUser.callType === "video" ? { width: 1280, height: 720 } : false, 
            audio: true 
        })
        .then((currentStream) => {
            setStream(currentStream);
            const peer = new Peer({ 
                initiator: false, 
                trickle: false, 
                stream: currentStream, 
                config: iceConfig 
            });

            peer.on("signal", (data) => {
                socket.emit("answer_call", { 
                    signal: data, 
                    to: otherUser.id, 
                    callId: activeCallId 
                });
            });

            peer.on("stream", (remoteStream) => {
                if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
            });

            peer.signal(callerSignal);
            connectionRef.current = peer;
        }).catch(() => {
            toast.error("CONNECTION_ERROR: Media Handshake Failed");
            handleCleanup();
        });
    }, [callerSignal, otherUser, socket, activeCallId, handleCleanup]);

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setMicActive(audioTrack.enabled);
            toast.info(audioTrack.enabled ? "MIC_ACTIVE" : "MIC_MUTED");
        }
    };

    return {
        stream, receivingCall, callAccepted, otherUser, isCalling, micActive,
        remoteVideo, startCall, answerCall, handleCleanup, toggleMic,
        setReceivingCall, setOtherUser, setCallerSignal, setCallAccepted, setActiveCallId, dialAudio, ringAudio
    };
};