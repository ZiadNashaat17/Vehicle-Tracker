import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import User from "../models/userModel.js";
import AppError from "../util/appError.js";
import logger from "../util/logger.js";

let io;

export const initSocket = httpServer => {
	io = new Server(httpServer, {
		cors: {
			origin: process.env.BASE_URL || "http://localhost:8000/",
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

			if (!user) return next(new AppError("Authentication error"), 401);

			socket.userId = user._id.toString();

			return next();
		} catch (error) {
			return next(new AppError(error.message, error.status));
		}
	});

	io.on("connection", async socket => {
		if (socket.userId) {
			logger.info(`User ${socket.userId} connected (socket ${socket.id})`);

			await User.findByIdAndUpdate(socket.userId, { status: "Online" });

			socket.join(socket.userId);

			socket.broadcast.emit("user-status-changed", {
				userId: socket.userId,
				status: "Online",
			});
		} else {
			logger.info(`Unauthenticated socket connected: ${socket.id}`);
		}

		logger.info(`Total connected clients: ${io.engine.clientsCount}`);

		// Join a single chat room
		socket.on("join-chat", async chatId => {
			socket.join(chatId);
			logger.info(`User ${socket.userId} joined chat ${chatId}`);

			// const messages = await Messages.find({ chatId });
			// messages.forEach(async m => {
			// 	m.seen = true;
			// 	await m.save();
			// });
		});

		// // Join multiple chat rooms at once (when user first connects)
		// socket.on("joinChats", chatIds => {
		// 	if (Array.isArray(chatIds)) {
		// 		chatIds.forEach(chatId => {
		// 			socket.join(chatId);
		// 		});
		// 		logger.info(`User ${socket.userId} joined ${chatIds.length} chats`);
		// 	}
		// });

		// Leave a chat room
		socket.on("leave-chat", chatId => {
			socket.leave(chatId);
			logger.info(`User ${socket.userId} left chat ${chatId}`);
		});

		// // Typing indicator
		// socket.on("typing", ({ chatId, isTyping }) => {
		// 	socket.to(chatId).emit("userTyping", {
		// 		chatId,
		// 		userId: socket.userId,
		// 		isTyping,
		// 	});
		// });

		socket.on("disconnect", async _reason => {
			if (socket.userId) {
				logger.info(`User ${socket.userId} disconnected`);

				await User.findByIdAndUpdate(socket.userId, { status: "Offline" });

				socket.leave(socket.userId);

				socket.broadcast.emit("user-status-changed", {
					userId: socket.userId,
					status: "Offline",
				});
			} else {
				logger.info(`Client disconnected: ${socket.id}`);
			}

			logger.info(`Total connected clients: ${io.engine.clientsCount}`);
		});

		socket.on("error", error => {
			logger.error(`Socket error (${socket.id}):`, error);
		});
	});

	logger.info("Socket.IO server initialized");
};

export const getIO = () => {
	if (!io) {
		throw new Error("Socket.io not initialized!");
	}
	return io;
};
