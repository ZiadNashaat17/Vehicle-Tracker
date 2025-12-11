import app from "./app.js";
import { closeRabbitMQ, connectRabbitMQ } from "./services/publishToRabbitMQ.js";

const port = process.env.PORT || 3001;
let server;

// Register global error handlers first, before any async operations
process.on("uncaughtException", err => {
	console.error("UNCAUGHT EXCEPTION! Shutting down immediately...");
	console.error(err.name, err.message);
	console.error(err.stack);
	process.exit(1);
});

process.on("unhandledRejection", err => {
	console.error("UNHANDLED REJECTION! Shutting down...");
	console.error(err.name, err.message);
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
			console.log(`Publisher service is up and running on port: ${port}`);
		});

		process.on("SIGTERM", () => {
			console.log("SIGTERM signal received: closing server");
			gracefulShutdown();
		});

		process.on("SIGINT", () => {
			console.log("SIGINT signal received: closing server");
			gracefulShutdown();
		});
	} catch (error) {
		console.error("Publisher service startup error:", error);
		process.exit(1);
	}
})();

const gracefulShutdown = () => {
	console.log("Starting graceful shutdown...");

	const forceShutdownTimer = setTimeout(() => {
		console.error("Forced shutdown due to timeout");
		process.exit(1);
	}, 30000);

	if (server) {
		server.close(err => {
			if (err) {
				console.error("Error closing server: ", err);
				clearTimeout(forceShutdownTimer);
				process.exit(1);
			}

			console.log("Server closed. Closing other resources...");
			closeResourcesAndExit(forceShutdownTimer);
		});

		server.closeAllConnections();
	} else {
		closeResourcesAndExit(forceShutdownTimer);
	}
};

const closeResourcesAndExit = async timer => {
	try {
		console.log("Closing RabbitMQ connection...");
		await closeRabbitMQ();
		console.log("RabbitMQ disconnected");

		console.log("All resources closed successfully. Exiting.");
		clearTimeout(timer);
		process.exit(0);
	} catch (err) {
		console.error("Error during resource cleanup:", err);
		clearTimeout(timer);
		process.exit(1);
	}
};
