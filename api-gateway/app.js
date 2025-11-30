import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

config({ path: './config.env' });

import AppError from './src/util/appError.js';
import globalErrorHandler from './src/middlewares/errorController.js';
import publisherRouter from './src/routes/publisherRoutes.js';
import consumerRouter from './src/routes/consumerRoutes.js';
import userRouter from './src/routes/userRoutes.js';

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

app.use('/api/track', publisherRouter);
app.use('/api/history', consumerRouter);
app.use('/api/user', userRouter);

app.disable('x-powered-by');

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
