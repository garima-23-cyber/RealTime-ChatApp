import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { fetchChats } from "../api/chatAPI";
import ChatSidebar from "../components/Chat/ChatSidebar";
import MessageWindow from "../components/Chat/MessageWindow";
import SplashScreen from "../components/Splash/SplashScreen";
import ParallaxBackground from "../components/Shared/ParallaxBackground"; 
import { toast } from "react-toastify"; // ✅ Switched to your new Toastify system

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  // 1. Core Data Synchronization
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await fetchChats();
        // Standardize the data array for the 3D list renderer
        setChats(res.data.chats || []);
      } catch (err) {
        toast.error("DATA_SYNC_FAILURE: Unable to reach Node Cluster");
      } finally {
        setIsLoading(false);
      }
    };
    loadChats();
  }, []);

  // 2. Real-time Packet Handling (Socket Listeners)
  useEffect(() => {
    if (!socket) return;

    // Listen for new secure channels
    socket.on("new_chat_created", (newChat) => {
      setChats((prev) => {
        if (prev.find((c) => c._id === newChat._id)) return prev;
        return [newChat, ...prev];
      });
      toast.info("NEW_SIGNAL: Secure Channel Established");
    });

    // Handle Incoming Message Packets
    socket.on("receive message", (newMessage) => {
      setChats((prev) => {
        const chatId = newMessage.chat?._id || newMessage.chat;
        
        // Mechanical Reordering: Move active chat to the top with updated preview
        const otherChats = prev.filter(c => c._id !== chatId);
        const activeChat = prev.find(c => c._id === chatId);

        if (activeChat) {
          const updatedChat = { 
            ...activeChat, 
            latestMessage: newMessage,
            // Increment unread count if not currently viewing this chat
            unreadCount: (selectedChat?._id !== chatId) 
              ? (activeChat.unreadCount || 0) + 1 
              : 0 
          };
          return [updatedChat, ...otherChats];
        }
        return prev;
      });
    });

    // Handle Ghost Mode Auto-Purge UI sync
    socket.on("message_burn", ({ messageId, chatId }) => {
       setChats((prev) => prev.map(chat => {
          if (chat._id === chatId && chat.latestMessage?._id === messageId) {
             return { ...chat, latestMessage: { ...chat.latestMessage, content: "🔥 [SIGNAL_PURGED]" } };
          }
          return chat;
       }));
    });

    return () => {
      socket.off("new_chat_created");
      socket.off("receive message");
      socket.off("message_burn");
    };
  }, [socket, selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    // Clear unread badge on selection
    setChats(prev => prev.map(c => c._id === chat._id ? { ...c, unreadCount: 0 } : c));
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className="relative h-[calc(100vh-73px)] w-full overflow-hidden perspective-1000 bg-[#050505]">
      <ParallaxBackground />

      <div className="flex h-full w-full relative z-10 p-3 md:p-6 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        {/* 📟 Tactical Sidebar */}
        <div className="w-full md:w-[380px] lg:w-[450px] shrink-0 rounded-[3rem] border border-white/10 bg-black/30 backdrop-blur-3xl shadow-glass-surface overflow-hidden hidden md:block transition-all duration-700 hover:shadow-neon-pink preserve-3d">
          <ChatSidebar 
            chats={chats} 
            onSelectChat={handleSelectChat} 
            selectedId={selectedChat?._id} 
          />
        </div>

        {/* 🖥️ Main Viewport */}
        <div className="flex-1 flex flex-col rounded-[3rem] border border-white/10 bg-white/[0.01] backdrop-blur-2xl shadow-glass-surface overflow-hidden relative group preserve-3d">
          
          {/* Ambient Lighting FX */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-syncra-pink/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-syncra-pink/20 transition-all duration-1000" />

          {selectedChat ? (
            <MessageWindow 
              key={selectedChat._id} 
              chat={selectedChat} 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 preserve-3d">
               {/* Central Holographic Hub */}
               <div className="relative p-16 group/hub">
                  <div className="absolute inset-0 border-2 border-syncra-pink/5 rounded-full animate-orbit-slow" />
                  <div className="absolute inset-4 border border-white/5 rounded-full animate-orbit-reverse" />
                  
                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-syncra-dark border-2 border-syncra-pink/30 rounded-[2.5rem] shadow-neon-pink flex items-center justify-center mx-auto mb-12 transform -rotate-12 group-hover/hub:rotate-0 transition-all duration-1000 ease-out cursor-none">
                      <svg className="w-14 h-14 text-syncra-pink animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-5.19 4.593-9.187 9.636-9.187.202 0 .402.004.601.011" />
                      </svg>
                    </div>
                    
                    <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">
                      Syncra <span className="text-syncra-pink">Engine</span>
                    </h3>
                    <div className="flex flex-col gap-2 items-center">
                      <p className="text-syncra-silver text-[10px] uppercase tracking-[0.6em] font-black opacity-40">
                        System_Status: Awaiting_Input
                      </p>
                      <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-syncra-pink/40 to-transparent mt-4" />
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 🎞️ Full Page Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-[0.03] z-50" />
    </div>
  );
};

export default ChatPage;