import amqp from "amqplib";

import { updateDeviceLastLocation } from "../controllers/deviceController.js";
import { LOGGER } from "../logging.js";
import Record from "../models/recordModel.js";
import { cacheLatestRecord, clearHash } from "./redisCache.js";

let channel;
let connection;

export const consumeRabbitMQ = async io => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost:5672");
    channel = await connection.createChannel();
    const result = await channel.assertQueue("vehicle-tracking");

    // // Purge existing messages from the queue
    // await channel.purgeQueue('vehicle-tracking');
    // console.log('Queue purged - old messages removed');

    channel.prefetch(1);

    channel.consume("vehicle-tracking", async message => {
      try {
        const input = JSON.parse(message.content.toString());
        LOGGER.info(`User received record: ${JSON.stringify(input)}`);

        const record = await Record.create(input);

        LOGGER.info("new record created: ", record);

        cacheLatestRecord(record);

        const userId = await updateDeviceLastLocation(record);

        LOGGER.info("Cleaning hash: ", userId);
        clearHash(userId);

        if (io && userId) {
          const roomId = userId.toString();
          io.to(roomId).emit("device:live", record);
          LOGGER.info(`Emitted live update to room: ${roomId} for device: ${record.deviceId}`);
        }

        if (input) {
          channel.ack(message);
        }
      } catch (error) {
        LOGGER.error("Error processing message:", error);
        // Negative acknowledge and requeue the message
        channel.nack(message, false, true);
      }
    });

    LOGGER.info("Waiting for messages...");
  } catch (error) {
    LOGGER.error({ description: "Error consuming RabbitMQ", error });
  }
};

export const closeRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close();
      LOGGER.info("RabbitMQ channel closed");
    }
    if (connection) {
      await connection.close();
      LOGGER.info("RabbitMQ connection closed");
    }
  } catch (error) {
    LOGGER.error({ description: "Error closing RabbitMQ:", error });
    throw error;
  }
};
