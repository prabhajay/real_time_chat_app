import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//Create Express app and HTTP server

const app = express();
const server = http.createServer(app);

//Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});

//store online usesrs
export const userSocketMap = {}; //{ userId :socketId}

//Socket.io connection handler
// File: backend/server.js (or your main backend file)

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (!userId) {
    console.log("Socket connection rejected: no userId");
    socket.disconnect(true); // disconnect unauthorized socket immediately
    return;
  }

  console.log("User connected", userId);
  userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


//Middleware Setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

//connect to mongoDB
await connectDB();
if(process.env.NODE_ENV !=="production"){
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT:" + PORT));
}

//Export server for vercel
export default server;