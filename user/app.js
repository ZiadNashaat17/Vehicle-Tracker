import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import AppError from './src/util/appError.js';
import globalErrorHandler from './src/services/errorController.js';
import userRouter from './src/routes/userRoutes.js';
import deviceRouter from './src/routes/deviceRoutes.js';
import vehicleRouter from './src/routes/vehicleRoutes.js';
import geofenceRouter from './src/routes/geofenceRoutes.js';
import liveRouter from './src/routes/liveRoutes.js';

const app = express();
const limit = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use('/api', limit);

app.disable('x-powered-by');

app.use('/api/user', userRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/device', deviceRouter);
app.use('/api/geofence', geofenceRouter);
app.use('/api/live', liveRouter);

app.use(globalErrorHandler);
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

export default app;
