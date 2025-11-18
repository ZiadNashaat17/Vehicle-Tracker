import express from 'express';
import morgan from 'morgan';
// import hpp from 'hpp';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import globalErrorHandler from './src/api-gateway/controllers/errorController.js';
import vehicleRouter from './src/api-gateway/routes/vehicleRoutes.js';
import userRouter from './src/api-gateway/routes/userRoutes.js';
import trackRouter from './src/consumer/trackRoutes.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// const limiter = rateLimit({
//   max: 10000,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!',
// });

// app.use('/api', limiter);
// app.use(helmet());
// app.use(mongoSanitize());

app.use('/api/v1/vehicles', vehicleRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/track', trackRouter);

app.use(globalErrorHandler);

export default app;
