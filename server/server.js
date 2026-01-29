const fileUpload = require("express-fileupload");
const { cloudinaryConnect } = require("./config/Cloudinary");
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// CORE MODELS
const Message = require("./models/Message");
const Chat = require("./models/Chat");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Notification = require("./models/Notification");
const CallLog = require("./models/CallLog");

dotenv.config();

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

database.connect();
cloudinaryConnect();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// ROUTES
app.use("/api/v1/auth", require("./routes/Auth"));
app.use("/api/v1/chat", require("./routes/Chat"));
app.use("/api/v1/message", require("./routes/Message"));
app.use("/api/v1/notification", require("./routes/Notification"));
app.use("/api/v1/contacts", require("./routes/Contact"));
app.use("/api/v1/profile", require("./routes/Profile"));
app.use("/api/v1/call", require("./routes/Call"));

const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: { origin: CLIENT_URL, methods: ["GET", "POST"] },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Auth failed"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; 
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket.user.id || socket.user._id).toString();
  
  socket.join(userId); 
  User.findByIdAndUpdate(userId, { isOnline: true }).exec();
  io.emit("user_status_update", { userId, isOnline: true });

  socket.on("join chat", async (roomId) => {
    if (!roomId) return;
    socket.join(roomId.toString());
  });

  // ✉️ 1. MESSAGE LOGIC
  socket.on("send message", async (newMessageReceived) => {
    const { content, chat: chatObj, isGhostMode, messageType, fileName } = newMessageReceived;
    const chatId = (chatObj?._id || chatObj).toString();

    try {
      let message = await Message.create({
        sender: userId,
        content,
        chat: chatId,
        messageType: messageType || "text",
        isGhostMode: isGhostMode || false,
        fileName: fileName || null
      });

      message = await Message.findById(message._id)
        .populate("sender", "username image email")
        .populate("chat");

      socket.to(chatId).emit("receive message", message);
      socket.emit("message_sent_confirm", { tempId: newMessageReceived._id, realMessage: message });

      await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

      if (isGhostMode) {
        setTimeout(async () => {
          await Message.findByIdAndDelete(message._id);
          io.to(chatId).emit("message_burn", { messageId: message._id, chatId });
        }, 15000);
      }
    } catch (error) { console.error("Message Error:", error); }
  });

  // 📞 2. CALLING LOGIC (The "Signal Fix")
  socket.on("call_user", async (data) => {
    const { userToCall, signalData, from, name, callType, chatId } = data;
    
    // Safety check: If no chatId is provided, we can't log the call properly
    if (!chatId) return console.error("Call blocked: Missing ChatID context");

    try {
        const newLog = await CallLog.create({
            participants: [userId, userToCall],
            chat: chatId,
            callType: callType,
            status: "missed", // Initial state
            startTime: Date.now()
        });

        socket.to(userToCall.toString()).emit("incoming_call", {
            signal: signalData,
            from: userId,
            name: name,
            callType: callType,
            callId: newLog._id,
            chatId: chatId
        });

        socket.emit("call_initiated", { callId: newLog._id });
    } catch (err) { console.error("Call Log Error:", err); }
  });

  socket.on("answer_call", async (data) => {
    const { to, signal, callId } = data;
    if (callId) {
        await CallLog.findByIdAndUpdate(callId, { status: "completed" }).exec();
    }
    socket.to(to.toString()).emit("call_accepted", signal);
  });

  socket.on("reject_call", async ({ to, callId, chatId }) => {
    if (callId && chatId) {
        await CallLog.findByIdAndUpdate(callId, { status: "rejected" }).exec();
        
        const missedMsg = await Message.create({
            sender: userId, 
            content: `Missed Call`,
            chat: chatId,
            messageType: "call_log",
        });
        
        const populated = await missedMsg.populate("sender", "username image");
        io.to(chatId.toString()).emit("receive message", populated);
    }
    if (to) io.to(to.toString()).emit("call_rejected");
  });

  socket.on("end_call", async ({ to, callId, duration, chatId }) => {
    try {
        if (callId && chatId) {
            const log = await CallLog.findByIdAndUpdate(callId, { 
                duration: duration || 0,
                status: (duration > 0) ? "completed" : "missed" 
            }, { new: true }).exec();

            // Create the bubble in chat timeline
            const callMessage = await Message.create({
                sender: userId,
                content: (duration > 0) ? `${log.callType === "video" ? "Video" : "Voice"} Call` : `Missed ${log.callType} Call`,
                chat: chatId,
                messageType: "call_log",
                callDuration: duration || 0
            });

            const populatedMsg = await callMessage.populate("sender", "username image");
            
            // Broadcast to the chat room
            io.to(chatId.toString()).emit("receive message", populatedMsg);
            
            // Update the sidebar preview
            await Chat.findByIdAndUpdate(chatId, { latestMessage: callMessage._id }).exec();
        }
    } catch (err) { console.error("End Call Error:", err); }
    
    if (to) io.to(to.toString()).emit("call_ended");
  });

  socket.on("disconnect", () => {
    setTimeout(async () => {
      const activeSockets = await io.in(userId).fetchSockets();
      if (activeSockets.length === 0) {
        await User.findByIdAndUpdate(userId, { isOnline: false }).exec();
        io.emit("user_status_update", { userId, isOnline: false });
      }
    }, 5000);
  });
});

server.listen(PORT, () => console.log(`🚀 Syncra Engine Live on ${PORT}`));