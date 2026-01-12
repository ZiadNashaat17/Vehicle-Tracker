import app from "./app.js";
import { LOGGER } from "./logging.js";

const port = process.env.PORT || 5000;
let server;

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
    server = app.listen(port, () => {
      LOGGER.info(`API-Gateway service is up and running on port: ${port}`);
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
    LOGGER.error("API-Gateway service startup error: ", error);
  }
})();

const gracefulShutdown = () => {
  LOGGER.info("Starting graceful shutdown...");

  const forceShutdownTimer = setTimeout(() => {
    LOGGER.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 30000);

  server.close(err => {
    if (err) {
      LOGGER.error("Error closing server: ", err);
      clearTimeout(forceShutdownTimer);
      process.exit(1);
    }
    LOGGER.info("Server closed successfully");
    process.exit(0);
  });

  // Stop accepting new connections
  server.closeAllConnections();
};
