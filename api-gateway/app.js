import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const limit = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use(express.json());
app.use(helmet());
app.use('/api', limit);

if (process.env.NODE_ENV.trim() === 'development') {
  app.use(morgan('dev'));
}

app.disable('x-powered-by');

export default app;
