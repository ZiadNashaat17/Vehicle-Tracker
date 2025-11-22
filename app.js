import express from 'express';
import morgan from 'morgan';
// import hpp from 'hpp';
// import helmet from 'helmet';
// import mongoSanitize from 'express-mongo-sanitize';
// import rateLimit from 'express-rate-limit';

import globalErrorHandler from './src/services/errorController.js';
import vehicleRouter from './src/api-gateway/routes/vehicleRoutes.js';
import userRouter from './src/api-gateway/routes/userRoutes.js';
import trackRoutes from './src/publisher/routes/trackRoutes.js';
import deviceRouter from './src/api-gateway/routes/deviceRoutes.js';
import liveRouter from './src/api-gateway/routes/liveRoutes.js';

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
app.use('/api/v1/track', trackRoutes);
app.use('/api/v1/device', deviceRouter);
app.use('/api/v1/live', liveRouter);

app.use(globalErrorHandler);

export default app;
