import { config } from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";
import path from "node:path";

config({ path: "./config.env" });

import globalErrorHandler from "./middlewares/errorController.js";
import chatRouter from "./routes/chatRoutes.js";
import publisherRouter from "./routes/publisherRoutes.js";
import userRouter from "./routes/userRoutes.js";
import AppError from "./util/appError.js";

const app = express();
const limit = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
const __dirname = import.meta.dirname;

app.use(express.static(path.join(__dirname, "../public")));

app.use(
  "/socket.io",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    ws: true,
    changeOrigin: true,
  })
);

app.use(express.json());
app.use(helmet());
// app.use("/api", limit);

if (process.env.NODE_ENV?.trim() === "development") {
  app.use(morgan("dev"));
}

app.use("/api/track", publisherRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

app.set("trust proxy", 1);

app.disable("x-powered-by");

app.use((req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
