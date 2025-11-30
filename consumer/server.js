import { config } from 'dotenv';
import app from './app.js';
import consumeRabbitMQ from './src/services/consumeRabbitMQ.js';
import { initRedisPublisher } from './src/services/redisChannelPublish.js';
import { connect } from 'mongoose';

config({ path: './config.env' });

const port = process.env.PORT || 3002;

(async () => {
  try {
    await connect(process.env.DATABASE);
    console.log('Consumer connected to DB successfully!');

    await consumeRabbitMQ();
    await initRedisPublisher();

    app.listen(port, () => {
      console.log(`Consumer service is up and running on port: ${port}`);
    });
  } catch (error) {
    console.error('Consumer service startup error: ', error);
    process.exit(1);
  }
})();
