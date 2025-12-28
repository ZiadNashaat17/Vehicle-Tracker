import amqp from "amqplib";

let channel;
let connection;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertQueue("vehicle-tracking", { durable: true });

    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("RabbitMQ connection error: ", error);

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

    console.log("Record published to queue: ", message);
  } catch (error) {
    console.error("Error publishing to RabbitMQ: ", error);

    throw error;
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
