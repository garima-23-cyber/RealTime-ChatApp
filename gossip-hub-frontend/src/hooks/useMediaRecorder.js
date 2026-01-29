import { useState, useRef, useCallback, useEffect } from "react";

export const useMediaRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef(null);
  const timerInterval = useRef(null);
  const audioChunks = useRef([]);
  const activeStream = useRef(null); // ✅ Track stream separately for reliable cleanup

  // CLEANUP: Ensure mic stops if component unmounts
  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (activeStream.current) {
        activeStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStream.current = stream; // ✅ Store stream reference
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
                       ? 'audio/webm' 
                       : MediaRecorder.isTypeSupported('audio/mp4')
                       ? 'audio/mp4' 
                       : 'audio/ogg';

      mediaRecorder.current = new MediaRecorder(stream, { mimeType });
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start(10); // ✅ Small timeslice (10ms) captures data more reliably
      setIsRecording(true);
      
      setRecordingTime(0);
      timerInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
      throw err; 
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      // ✅ Safety check: If recorder doesn't exist or is already stopping
      if (!mediaRecorder.current || mediaRecorder.current.state === "inactive") {
        setIsRecording(false);
        if (timerInterval.current) clearInterval(timerInterval.current);
        return resolve(null);
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { 
          type: mediaRecorder.current.mimeType 
        });
        
        const extension = audioBlob.type.includes('webm') ? 'webm' : 'm4a';
        const audioFile = new File([audioBlob], `vibe_${Date.now()}.${extension}`, { 
          type: audioBlob.type 
        });
        
        // ✅ STOP TRACKS AFTER DATA IS PROCESSED
        if (activeStream.current) {
          activeStream.current.getTracks().forEach((track) => track.stop());
          activeStream.current = null;
        }
        
        setIsRecording(false);
        if (timerInterval.current) clearInterval(timerInterval.current);
        resolve(audioFile);
      };

      mediaRecorder.current.stop();
    });
  }, []);

  return { isRecording, recordingTime, startRecording, stopRecording };
};