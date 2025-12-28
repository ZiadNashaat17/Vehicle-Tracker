import amqp from "amqplib";

import { updateDeviceLastLocation } from "../controllers/deviceController.js";
import Record from "../models/recordModel.js";
import { cacheLatestRecord, clearHash } from "./redisCache.js";

let channel;
let connection;

export const consumeRabbitMQ = async io => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost:5672");
    channel = await connection.createChannel();
    const _result = await channel.assertQueue("vehicle-tracking");

    // // Purge existing messages from the queue
    // await channel.purgeQueue('vehicle-tracking');
    // console.log('Queue purged - old messages removed');

    channel.prefetch(1);

    channel.consume("vehicle-tracking", async message => {
      try {
        const input = JSON.parse(message.content.toString());
        console.log(`User received record: ${JSON.stringify(input)}`);

        const record = await Record.create(input);

        console.log("new record created: ", record);

        cacheLatestRecord(record);

        const userId = await updateDeviceLastLocation(record);

        console.log("Cleaning hash: ", userId);
        clearHash(userId);

        if (io && userId) {
          const room = `user:${userId}`;
          io.to(room).emit("device:live", record);
          console.log(`Emitted live update to room: ${room} for device: ${record.deviceId}`);
        }

        if (input) {
          channel.ack(message);
        }
      } catch (error) {
        console.error("Error processing message:", error);
        // Negative acknowledge and requeue the message
        channel.nack(message, false, true);
      }
    });

    console.log("Waiting for messages...");
  } catch (err) {
    console.error(err);
  }
};

export const closeRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close();
      console.log("RabbitMQ channel closed");
    }
    if (connection) {
      await connection.close();
      console.log("RabbitMQ connection closed");
    }
  } catch (error) {
    console.error("Error closing RabbitMQ:", error);
    throw error;
  }
};
