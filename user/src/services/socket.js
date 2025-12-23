import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
// import Device from "../models/deviceModel.js";
import User from "../models/userModel.js";
import AppError from "../util/appError.js";

let io;

export const initializeSocket = httpServer => {
	io = new Server(httpServer, { cors: { origin: "*", methods: ["GET"] } });

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

		// socket.on("join:device-room", async (deviceId, ack) => {
		// 	try {
		// 		if (!socket.userId) {
		// 			console.log(`Unauthorized attempt to join device:${deviceId} by socket ${socket.id}`);

		// 			return ack?.({ error: "Authentication required to join device room" });
		// 		}

		// 		// Verify the user owns this device
		// 		const device = await Device.findById(deviceId);

		// 		if (!device) {
		// 			console.log(`Device ${deviceId} not found`);

		// 			return ack?.({ error: "Device not found" });
		// 		}

		// 		if (device.user.toString() !== socket.userId) {
		// 			console.log(
		// 				`User ${socket.userId} attempted to join device:${deviceId} without permission`,
		// 			);
		// 			return ack?.({ error: "Not authorized to access this device" });
		// 		}

		// 		socket.join(`device:${deviceId}`);

		// 		console.log(`Socket ${socket.id} (User ${socket.userId}) joined room: device:${deviceId}`);

		// 		socket.emit("joined", { deviceId, message: "Successfully joined device room" });

		// 		ack?.({ status: "ok", deviceId });
		// 	} catch (error) {
		// 		console.error("Error joining device room:", error);

		// 		ack?.({ error: "Failed to join device room" });
		// 	}
		// });

		// socket.on("leave:device-room", deviceId => {
		// 	socket.leave(`device:${deviceId}`);

		// 	console.log(`Socket ${socket.id} left room: device:${deviceId}`);
		// });

		socket.on("disconnect", _reason => {
			if (socket.userId) {
				console.log(`User ${socket.userId} disconnected`);
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
