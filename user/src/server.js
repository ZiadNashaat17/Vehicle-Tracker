import { createServer } from 'http';
import { connect, disconnect } from 'mongoose';

import app from './app.js';
import { initializeSocket } from './services/websocket.js';
import { initRedisSubscriber } from './services/redisChannelSubscribe.js';
import { closeRedis } from './services/redisCache.js';

const DB = process.env.DATABASE;
const port = process.env.PORT || 3000;
const httpServer = createServer(app);
let io;

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
    await connect(DB);
    console.log('User service connected to DB successfully!');

    io = initializeSocket(httpServer);

    await initRedisSubscriber(io);

    httpServer.listen(port, () => {
      console.log(`User service is up and running on port: ${port}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      gracefulShutdown();
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      gracefulShutdown();
    });
  } catch (err) {
    console.error('User service startup error: ', err);
    process.exit(1);
  }
})();

const gracefulShutdown = () => {
  console.log('Starting graceful shutdown...');

  const forceShutdownTimer = setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);

  if (httpServer) {
    httpServer.close(err => {
      if (err) {
        console.error('Error closing server: ', err);
        clearTimeout(forceShutdownTimer);
        process.exit(1);
      }

      console.log('HTTP server closed. Closing other resources...');
      closeResourcesAndExit(forceShutdownTimer);
    });

    // Immediately close all active connections
    httpServer.closeAllConnections();
  } else {
    closeResourcesAndExit(forceShutdownTimer);
  }
};

const closeResourcesAndExit = async timer => {
  try {
    if (io) {
      console.log('Closing Socket.IO connections...');
      io.close(() => {
        console.log('Socket.IO disconnected');
      });
    }

    console.log('Closing MongoDB connection...');
    await disconnect();
    console.log('MongoDB disconnected');

    console.log('Closing Redis connection...');
    await closeRedis();

    console.log('All resources closed successfully. Exiting.');
    clearTimeout(timer);
    process.exit(0);
  } catch (err) {
    console.error('Error during resource cleanup:', err);
    clearTimeout(timer);
    process.exit(1);
  }
};
