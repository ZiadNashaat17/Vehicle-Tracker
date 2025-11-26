import amqp from 'amqplib';

let channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');

    channel = await connection.createChannel();

    await channel.assertQueue('vehicle-tracking', { durable: true });

    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ connection error: ', error);

    throw error;
  }
};

export const publishRecord = async record => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const message = JSON.stringify(record);

    channel.sendToQueue('vehicle-tracking', Buffer.from(message), { persistent: true });

    console.log('Record published to queue: ', message);
  } catch (error) {
    console.error('Error publishing to RabbitMQ: ', error);

    throw error;
  }
};
