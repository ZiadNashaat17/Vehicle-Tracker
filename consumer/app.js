import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import recordRoutes from './src/routes/recordsRoutes.js';

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

app.use('/api/consumer', recordRoutes);

app.use((req, res, next) => {
  return res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default app;
