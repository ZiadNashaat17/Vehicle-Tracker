import amqp from 'amqplib';
import catchAsync from '../../util/catchAsync.js';
import Record from '../models/recordModel.js';
import { cacheLatestRecord } from './cache.js';

export default catchAsync(async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const channel = await connection.createChannel();
    const result = await channel.assertQueue('vehicle-tracking');

    // // Purge existing messages from the queue
    // await channel.purgeQueue('vehicle-tracking');
    // console.log('Queue purged - old messages removed');

    channel.prefetch(1);

    channel.consume('vehicle-tracking', async message => {
      try {
        const input = JSON.parse(message.content.toString());
        console.log(`Received record: ${JSON.stringify(input)}`);

        const record = await Record.create(input);
        cacheLatestRecord(input);

        if (record) {
          channel.ack(message);
        }
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
