import cors from "cors";
import { config } from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

config({ path: "./config.env" });

import globalErrorHandler from "./middlewares/errorController.js";
import deviceRouter from "./routes/deviceRoutes.js";
import geofenceRouter from "./routes/geofenceRoutes.js";
import liveRouter from "./routes/liveRoutes.js";
import userRouter from "./routes/userRoutes.js";
import AppError from "./util/appError.js";

const app = express();
const limit = rateLimit({
	max: 10000,
	windowMs: 60 * 60 * 1000,
	message: "Too many requests from this IP, please try again in an hour!",
});

app.use(express.json());
app.use(helmet());
app.use("/api", limit);
app.use(cors());

if (process.env.NODE_ENV.trim() === "development") {
	app.use(morgan("dev"));
}

app.set("trust proxy", 1);

app.disable("x-powered-by");

app.use("/api/user", userRouter);
app.use("/api/device", deviceRouter);
app.use("/api/geofence", geofenceRouter);
app.use("/api/live", liveRouter);

app.use((req, _res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
