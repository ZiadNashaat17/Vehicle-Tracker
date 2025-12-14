import { createClient } from "redis";

import { updateDeviceLastLocation } from "../controllers/deviceController.js";
import { clearHash } from "./redisCache.js";

let subClient;

export async function initRedisSubscriber(io) {
	subClient = createClient({ url: process.env.REDIS_URL });
	subClient.on("error", err => console.log("Redis Subscriber Error", err));
	subClient.on("connect", () => console.log("Redis Subscriber Connected"));

	await subClient.connect();

	await subClient.subscribe("new-record", async message => {
		const record = JSON.parse(message);
		console.log("User received record from consumer:", record);

		const userId = await updateDeviceLastLocation(record);

		console.log("Cleaning hash: ", userId);
		clearHash(userId);

		if (io && record.deviceId) {
			const room = `device:${record.deviceId}`;
			io.to(room).emit("device:live", record);
			console.log(`Emitted live update to room: ${room} for device: ${record.deviceId}`);
		}
	});

	console.log("Redis subscriber initialized. listening for records from consumer...");
}
