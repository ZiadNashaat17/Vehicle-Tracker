import cors from "cors";
import { config } from "dotenv";
import express from "express";
import morgan from "morgan";

import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import AppError from "./util/appError.js";

config({ path: "./config.env" });

const app = express();

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV.trim() === "development") {
  app.use(morgan("dev"));
}

app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

app.use((req, res, next) => {
  // Silently ignore favicon requests
  if (req.url === "/favicon.ico") {
    return res.status(204).end();
  }

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
