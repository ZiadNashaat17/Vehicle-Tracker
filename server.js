import { config } from 'dotenv';
import { connect } from 'mongoose';
import app from './app.js';
import { connectRabbitMQ } from './src/publisher/rabbitMQ.js';
import consume from './src/consumer/consume.js';

config({ path: './config.env' });

const DB = process.env.DATABASE;
const PORT = process.env.PORT || 3000;

// Initialize database and RabbitMQ
const startServer = async () => {
  try {
    await connect(DB);
    console.log('DB connected successfully.');

    await connectRabbitMQ();

    app.listen(PORT, err => {
      console.log(`App listening on port: ${PORT}`);
    });

    consume();
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();
