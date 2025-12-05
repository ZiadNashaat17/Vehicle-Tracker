import app from './app.js';
import { consumeRabbitMQ } from './services/consumeRabbitMQ.js';
import { closeRedisPub, initRedisPublisher } from './services/redisChannelPublish.js';
import { connect, disconnect } from 'mongoose';
import { closeRedis } from './services/cache.js';

const port = process.env.PORT || 3002;
let server;

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! Shutting down immediately...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  gracefulShutdown();
});

(async () => {
  try {
    await connect(process.env.DATABASE);
    console.log('Consumer connected to DB successfully!');

    await consumeRabbitMQ();
    await initRedisPublisher();

    server = app.listen(port, () => {
      console.log(`Consumer service is up and running on port: ${port}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing server');
      gracefulShutdown();
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing server');
      gracefulShutdown();
    });
  } catch (error) {
    console.error('Consumer service startup error: ', error);
    process.exit(1);
  }
})();

const gracefulShutdown = () => {
  console.log('Starting graceful shutdown...');

  const forceShutdownTimer = setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);

  if (server) {
    server.close(err => {
      if (err) {
        console.error('Error closing server: ', err);
        clearTimeout(forceShutdownTimer);
        process.exit(1);
      }

      console.log('Server closed. Closing other resources...');
      closeResourcesAndExit(forceShutdownTimer);
    });

    // Stop accepting new connections
    server.closeAllConnections();
  } else {
    closeResourcesAndExit(forceShutdownTimer);
  }
};

const closeResourcesAndExit = async timer => {
  try {
    console.log('Closing MongoDB connection...');
    await disconnect();
    console.log('MongoDB disconnected');

    console.log('Closing Redis connection...');
    await closeRedis();

    console.log('Closing Redis Publisher connection...');
    await closeRedisPub();

    console.log('All resources closed successfully. Exiting.');
    clearTimeout(timer);
    process.exit(0);
  } catch (err) {
    console.error('Error during resource cleanup:', err);
    clearTimeout(timer);
    process.exit(1);
  }
};
