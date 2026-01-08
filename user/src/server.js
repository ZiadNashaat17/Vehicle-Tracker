import { connect, disconnect } from "mongoose";
import { createServer } from "node:http";

import app from "./app.js";
import { LOGGER } from "./logging.js";
import { consumeRabbitMQ } from "./services/consumeRabbitMQ.js";
import { closeRedis } from "./services/redisCache.js";
import { initializeSocket } from "./services/socket.js";

const DB = process.env.DATABASE;
const port = process.env.PORT || 3000;
const httpServer = createServer(app);
let io;

process.on("uncaughtException", err => {
  LOGGER.error("UNCAUGHT EXCEPTION! Shutting down immediately...");
  LOGGER.error(err.name, err.message);
  LOGGER.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", err => {
  LOGGER.error("UNHANDLED REJECTION! Shutting down...");
  LOGGER.error(err.name, err.message);
  gracefulShutdown();
});

(async () => {
  try {
    await connect(DB);
    LOGGER.info("User service connected to DB successfully!");

    io = await initializeSocket(httpServer);

    await consumeRabbitMQ(io);

    // await initRedisSubscriber(io);

    httpServer.listen(port, () => {
      LOGGER.info(`User service is up and running on port: ${port}`);
    });

    process.on("SIGTERM", () => {
      LOGGER.info("SIGTERM signal received: closing HTTP server");
      gracefulShutdown();
    });

    process.on("SIGINT", () => {
      LOGGER.info("SIGINT signal received: closing HTTP server");
      gracefulShutdown();
    });
  } catch (err) {
    LOGGER.error({ description: "User service startup error: ", err });
    process.exit(1);
  }
})();

const gracefulShutdown = () => {
  LOGGER.info("Starting graceful shutdown...");

  const forceShutdownTimer = setTimeout(() => {
    LOGGER.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 30000);

  if (httpServer) {
    httpServer.close(err => {
      if (err) {
        LOGGER.error("Error closing server: ", err);
        clearTimeout(forceShutdownTimer);
        process.exit(1);
      }

      LOGGER.info("HTTP server closed. Closing other resources...");
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
      LOGGER.info("Closing Socket.IO connections...");
      io.close(() => {
        LOGGER.info("Socket.IO disconnected");
      });
    }

    LOGGER.info("Closing MongoDB connection...");
    await disconnect();
    LOGGER.info("MongoDB disconnected");

    LOGGER.info("Closing Redis connection...");
    await closeRedis();

    LOGGER.info("All resources closed successfully. Exiting.");
    clearTimeout(timer);
    process.exit(0);
  } catch (err) {
    LOGGER.error("Error during resource cleanup:", err);
    clearTimeout(timer);
    process.exit(1);
  }
};
