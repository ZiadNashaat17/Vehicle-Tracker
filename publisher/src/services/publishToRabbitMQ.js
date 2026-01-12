import amqp from "amqplib";

import { LOGGER } from "../logging.js";

let channel;
let connection;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertQueue("vehicle-tracking", { durable: true });

    LOGGER.info("Connected to RabbitMQ");
  } catch (error) {
    LOGGER.error("RabbitMQ connection error: ", error);

    throw error;
  }
};

export const publishRecord = async record => {
  try {
    if (!channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    const message = JSON.stringify(record);

    channel.sendToQueue("vehicle-tracking", Buffer.from(message), { persistent: true });

    LOGGER.info("Record published to queue: ", message);
  } catch (error) {
    LOGGER.error("Error publishing to RabbitMQ: ", error);

    throw error;
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
    LOGGER.error("Error closing RabbitMQ:", error);
    throw error;
  }
};
