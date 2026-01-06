import { createAdapter } from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { promisify } from "node:util";
// import Device from "../models/deviceModel.js";
import { createClient } from "redis";
import { Server } from "socket.io";

import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import AppError from "../util/appError.js";

let io;

export const initializeSocket = async httpServer => {
  const pubClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io = new Server(httpServer, {
    adapter: createAdapter(pubClient, subClient),
    cors: {
      origin: process.env.BASE_URL || "http://localhost:5000/",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new AppError("Unauthenticated connection!", 401));
      }

      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      socket.userId = user._id.toString();
      return next();
    } catch (error) {
      return next(new AppError(error.message || "Authentication error", 401));
    }
  });

  io.on("connection", async socket => {
    console.log(`User ${socket.userId} connected (socket ${socket.id})`);

    socket.join(socket.userId);
    console.log("!!!socket userId ", socket.userId);

    try {
      await User.findByIdAndUpdate(socket.userId, { status: "Online" });

      socket.broadcast.emit("user-status-changed", {
        userId: socket.userId,
        status: "Online",
      });
    } catch (error) {
      console.error(`Failed to update user status for ${socket.userId}: `, error);
    }

    console.log("Total connected clients:", io.engine.clientsCount);

    socket.on("join-chat", async chatId => {
      try {
        if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
          socket.emit("error", { message: "Invalid chat ID" });
          return;
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit("error", { message: "Chat not found" });
          return;
        }

        // Check if user is a participant
        const isParticipant = chat.userIds.some(userId => {
          const id = userId._id || userId; // Handle both populated and unpopulated
          return id.toString() === socket.userId;
        });

        if (!isParticipant) {
          socket.emit("error", { message: "You don't have access to this chat!" });
          return;
        }

        socket.join(chatId);

        // Mark unseen messages as seen
        const updateResult = await Message.updateMany(
          { chatId, receiverId: socket.userId, seen: false },
          { $set: { seen: true, seenAt: Date.now() } }
        );

        if (updateResult.modifiedCount > 0) {
          io.to(chatId).emit("messages-read", {
            chatId,
            readerId: socket.userId,
            count: updateResult.modifiedCount,
            seenAt: Date.now(),
          });
        }

        socket.emit("joined-chat", { chatId, success: true });

        console.log(`User ${socket.userId} joined chat ${chatId}`);
      } catch (error) {
        console.error("Error in join-chat:", error);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    socket.on("leave-chat", chatId => {
      try {
        socket.leave(chatId);
        console.log(`User ${socket.userId} left chat ${chatId}`);
      } catch (error) {
        console.error("Error in leave-chat:", error);
      }
    });

    socket.on("disconnect", async reason => {
      try {
        console.log(`User ${socket.userId} disconnected: ${reason}`);

        await User.findByIdAndUpdate(socket.userId, { status: "Offline" });

        socket.broadcast.emit("user-status-changed", {
          userId: socket.userId,
          status: "Offline",
        });
      } catch (error) {
        console.error(`Error handling disconnect for ${socket.userId}:`, error);
      }
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
