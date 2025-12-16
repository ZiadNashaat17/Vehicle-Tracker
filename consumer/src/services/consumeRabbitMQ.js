import amqp from "amqplib";
import { publishRecord } from "./redisChannelPublish.js";

let channel;
let connection;

export const consumeRabbitMQ = async () => {
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
				console.log(`Consumer received record: ${JSON.stringify(input)}`);

				await publishRecord(input);

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
