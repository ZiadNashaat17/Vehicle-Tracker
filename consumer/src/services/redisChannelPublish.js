import { createClient } from "redis";

let pubClient;

export async function initRedisPublisher() {
	pubClient = createClient({ url: process.env.REDIS_URL });

	pubClient.on("error", err => console.log("Redis Publisher Error", err));

	await pubClient.connect();
	console.log("Redis publisher initialized");

	return pubClient;
}

export async function publishRecord(record) {
	if (!pubClient) {
		console.error("Redis publisher not initialized");
		return;
	}

	await pubClient.publish("new-record", JSON.stringify(record));
	console.log("Record published to Redis channel:", record);
}

export const closeRedisPub = async () => {
	try {
		if (pubClient) {
			await pubClient.quit();
			console.log("Redis disconnected");
		}
	} catch (error) {
		console.error("Error closing Redis:", error);
		throw error;
	}
};
