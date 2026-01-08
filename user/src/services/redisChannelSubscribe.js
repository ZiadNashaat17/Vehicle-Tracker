import { createClient } from "redis";

import { updateDeviceLastLocation } from "../controllers/deviceController.js";
import { LOGGER } from "../logging.js";
import Record from "../models/recordModel.js";
import { cacheLatestRecord, clearHash } from "./redisCache.js";

let subClient;

export async function initRedisSubscriber(io) {
  subClient = createClient({ url: process.env.REDIS_URL });
  subClient.on("error", err => LOGGER.info("Redis Subscriber Error", err));
  subClient.on("connect", () => LOGGER.info("Redis Subscriber Connected"));

  await subClient.connect();

  await subClient.subscribe("new-record", async message => {
    const input = JSON.parse(message);
    LOGGER.info("User received record from consumer:", input);

    const record = await Record.create(input);

    LOGGER.info("new record created: ", record);

    cacheLatestRecord(record);

    const userId = await updateDeviceLastLocation(record);

    LOGGER.info("Cleaning hash: ", userId);
    clearHash(userId);

    if (io && userId) {
      const room = `user:${userId}`;
      io.to(room).emit("device:live", record);
      LOGGER.info(`Emitted live update to room: ${room} for device: ${record.deviceId}`);
    }
  });

  LOGGER.info("Redis subscriber initialized. listening for records from consumer...");
}
