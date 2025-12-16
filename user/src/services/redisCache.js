import mongoose from "mongoose";
import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });
const exec = mongoose.Query.prototype.exec;

client.on("error", err => console.log("User Redis Client Error", err));
client.on("connect", () => console.log("User Redis Client Connected"));

await client.connect();

mongoose.Query.prototype.cache = function (options = {}) {
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || "");

	return this;
};

mongoose.Query.prototype.exec = async function () {
	if (!this.useCache) {
		// biome-ignore lint/complexity/noArguments: <>
		return exec.apply(this, arguments);
	}
	const key = JSON.stringify(
		Object.assign({}, this.getQuery(), {
			collection: this.mongooseCollection.name,
		}),
	);

	const cacheValue = await client.hGet(this.hashKey, key);
	if (cacheValue) {
		const doc = JSON.parse(cacheValue);

		console.log("Serving from cache");

		// Use hydrate() to properly restore Mongoose documents with populated fields
		return Array.isArray(doc) ? doc.map(d => this.model.hydrate(d)) : this.model.hydrate(doc);
	}
	// biome-ignore lint/complexity/noArguments: <>
	const result = await exec.apply(this, arguments);

	console.log("populate", this._mongooseOptions.populate);

	console.log("result: ", result);

	console.log("key: ", key);

	client.hSet(this.hashKey, key, JSON.stringify(result), "EX", 300);

	return result;
};

export const clearHash = hashKey => {
	client.del(JSON.stringify(hashKey));
};

export const cacheLatestRecord = async record => {
	const key = `device:${record.deviceId}`;

	await client.setEx(key, 3600, JSON.stringify(record));
};

export const getCachedRecord = async deviceId => {
	const key = `device:${deviceId}`;

	const record = await client.get(key);

	if (!record) {
		return null;
	}

	return JSON.parse(record);
};

export const closeRedis = async () => {
	try {
		if (client) {
			await client.quit();
			console.log("Redis disconnected");
		}
	} catch (error) {
		console.error("Error closing Redis:", error);
		throw error;
	}
};
