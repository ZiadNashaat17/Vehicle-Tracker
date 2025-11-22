import { config } from 'dotenv';
import { connect } from 'mongoose';
import { createServer } from 'http';
import app from './app.js';
import { connectRabbitMQ } from './src/publisher/services/publishToRabbitMQ.js';
import consumeRabbitMQ from './src/consumer/services/consumeRabbitMQ.js';
import { initRedisPublisher } from './src/consumer/services/redisChannelPublish.js';
import { initRedisSubscriber } from './src/api-gateway/services/redisChannelSubscribe.js';
// import { initializeSocket } from './src/api-gateway/services/websocket.js';

config({ path: './config.env' });

const DB = process.env.DATABASE;
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

// Initialize database and RabbitMQ
const startServer = async () => {
  try {
    await connect(DB);
    console.log('DB connected successfully.');

    await connectRabbitMQ();
    await initRedisPublisher();
    await initRedisSubscriber();

    httpServer.listen(PORT, err => {
      console.log(`Server listening on port: ${PORT}`);
    });

    // initializeSocket();
    await consumeRabbitMQ();
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

export default httpServer;
