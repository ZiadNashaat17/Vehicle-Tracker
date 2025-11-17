import express from 'express';
import morgan from 'morgan';

import globalErrorHandler from './src/controllers/errorController.js';
import vehicleRouter from './src/routes/vehicleRoutes.js';
import userRouter from './src/routes/userRoutes.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/vehicles', vehicleRouter);
app.use('/api/v1/user', userRouter);

app.use(globalErrorHandler);

export default app;
