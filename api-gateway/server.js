import app from './app.js';

const port = process.env.PORT || 5000;
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
    server = app.listen(port, () => {
      console.log(`API-Gateway service is up and running on port: ${port}`);
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
    console.error('API-Gateway service startup error: ', error);
  }
})();

const gracefulShutdown = () => {
  console.log('Starting graceful shutdown...');

  const forceShutdownTimer = setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);

  server.close(err => {
    if (err) {
      console.error('Error closing server: ', err);
      clearTimeout(forceShutdownTimer);
      process.exit(1);
    }
    console.log('Server closed successfully');
    process.exit(0);
  });

  // Stop accepting new connections
  server.closeAllConnections();
};
