import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';

config({ path: './config.env' });

import AppError from './util/appError.js';
import globalErrorHandler from './middlewares/errorController.js';
import recordRoutes from './routes/recordsRoutes.js';

const app = express();
const limit = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use(express.json());
app.use(helmet());
app.use('/api', limit);

if (process.env.NODE_ENV?.trim() === 'development') {
  app.use(morgan('dev'));
}

app.disable('x-powered-by');

app.use('/api/consumer', recordRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
