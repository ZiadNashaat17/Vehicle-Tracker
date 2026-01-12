import app from "./app.js";
import { LOGGER } from "./logging.js";
import { closeRabbitMQ, connectRabbitMQ } from "./services/publishToRabbitMQ.js";

const port = process.env.PORT || 3001;
let server;

// Register global error handlers first, before any async operations
process.on("uncaughtException", err => {
  LOGGER.error("UNCAUGHT EXCEPTION! Shutting down immediately...");
  LOGGER.error(err.name, err.message);
  LOGGER.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", err => {
  LOGGER.error("UNHANDLED REJECTION! Shutting down...");
  LOGGER.error(err.name, err.message);
  if (server) {
    gracefulShutdown();
  } else {
    process.exit(1);
  }
});

(async () => {
  try {
    await connectRabbitMQ();

    server = app.listen(port, () => {
      LOGGER.info(`Publisher service is up and running on port: ${port}`);
    });

    process.on("SIGTERM", () => {
      LOGGER.info("SIGTERM signal received: closing server");
      gracefulShutdown();
    });

    process.on("SIGINT", () => {
      LOGGER.info("SIGINT signal received: closing server");
      gracefulShutdown();
    });
  } catch (error) {
    LOGGER.error("Publisher service startup error:", error);
    process.exit(1);
  }
})();

const gracefulShutdown = () => {
  LOGGER.info("Starting graceful shutdown...");

  const forceShutdownTimer = setTimeout(() => {
    LOGGER.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 30000);

  if (server) {
    server.close(err => {
      if (err) {
        LOGGER.error("Error closing server: ", err);
        clearTimeout(forceShutdownTimer);
        process.exit(1);
      }

      LOGGER.info("Server closed. Closing other resources...");
      closeResourcesAndExit(forceShutdownTimer);
    });

    server.closeAllConnections();
  } else {
    closeResourcesAndExit(forceShutdownTimer);
  }
};

const closeResourcesAndExit = async timer => {
  try {
    LOGGER.info("Closing RabbitMQ connection...");
    await closeRabbitMQ();
    LOGGER.info("RabbitMQ disconnected");

    LOGGER.info("All resources closed successfully. Exiting.");
    clearTimeout(timer);
    process.exit(0);
  } catch (err) {
    LOGGER.error("Error during resource cleanup:", err);
    clearTimeout(timer);
    process.exit(1);
  }
};
