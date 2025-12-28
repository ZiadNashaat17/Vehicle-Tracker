import jwt from "jsonwebtoken";
import { promisify } from "node:util";
import { Server } from "socket.io";

// import Device from "../models/deviceModel.js";
import User from "../models/userModel.js";
import AppError from "../util/appError.js";

let io;

export const initializeSocket = httpServer => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.BASE_URL || "http://localhost:5000/",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) return next();

      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) return next(new AppError("Authentication error", 401));

      socket.userId = user._id.toString();

      return next();
    } catch (_err) {
      return next();
    }
  });

  io.on("connection", socket => {
    if (socket.userId) {
      console.log(`User ${socket.userId} connected (socket ${socket.id})`);

      socket.join(`user:${socket.userId}`);

      console.log(`Socket ${socket.id} (User ${socket.userId}) joined room: user:${socket.userId}`);
    } else {
      console.log(`Unauthenticated socket connected: ${socket.id}`);
    }

    console.log("Total connected clients:", io.engine.clientsCount);

    socket.on("join-chat", async chatId => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    socket.on("leave-chat", chatId => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    socket.on("disconnect", async reason => {
      if (socket.userId) {
        console.log(`User ${socket.userId} disconnected`);

        await User.findByIdAndUpdate(socket.userId, { status: "Offline" });

        socket.leave(socket.userId);

        socket.broadcast.emit("user-status-changed", {
          userId: socket.userId,
          status: "Offline",
        });
      } else {
        console.log("Client disconnected:", socket.id);
      }

      console.log("Total connected clients:", io.engine.clientsCount);
    });

    socket.on("error", error => {
      console.error("Socket error:", socket.id, error);
    });
  });

  console.log("Socket.IO server initialized");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
