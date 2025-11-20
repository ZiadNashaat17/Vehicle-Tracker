import amqp from 'amqplib';
import catchAsync from '../../api-gateway/util/catchAsync.js';
import Record from '../models/recordModel.js';

export default catchAsync(async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const channel = await connection.createChannel();
    const result = await channel.assertQueue('vehicle-tracking');

    // // Purge existing messages from the queue
    // await channel.purgeQueue('vehicle-tracking');
    // console.log('Queue purged - old messages removed');

    // Set prefetch to 1 (process one message at a time)
    channel.prefetch(1);

    channel.consume('vehicle-tracking', async message => {
      try {
        const input = JSON.parse(message.content.toString());
        console.log(`Received record: ${JSON.stringify(input)}`);
        // console.log(`Received record: ${input.vehicleId}`);

        // Acknowledge the message after successful processing
        channel.ack(message);

        const record = await Record.create(input);
      } catch (error) {
        console.error('Error processing message:', error);
        // Negative acknowledge and requeue the message
        channel.nack(message, false, true);
      }
    });

    console.log('Waiting for messages...');
  } catch (err) {
    console.error(err);
  }
});
