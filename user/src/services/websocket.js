import { Server } from "socket.io";

let io;

export const initializeSocket = httpServer => {
	io = new Server(httpServer, { cors: { origin: "*" } });

	io.on("connection", socket => {
		console.log("Client connected:", socket.id);
		console.log("Total connected clients:", io.engine.clientsCount);

		socket.on("join:device-room", deviceId => {
			socket.join(`device:${deviceId}`);
			console.log(`Socket ${socket.id} joined room: device:${deviceId}`);
			socket.emit("joined", { deviceId, message: "Successfully joined device room" });
		});

		socket.on("leave:device-room", deviceId => {
			socket.leave(`device:${deviceId}`);
			console.log(`Socket ${socket.id} left room: device:${deviceId}`);
		});

		socket.on("disconnect", _reason => {
			console.log("Client disconnected:", socket.id);
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
