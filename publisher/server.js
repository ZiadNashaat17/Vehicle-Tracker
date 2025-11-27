import { config } from 'dotenv';
import app from './app.js';
import { connectRabbitMQ } from './src/services/publishToRabbitMQ.js';

config({ path: './config.env' });

const port = process.env.PORT || 3001;

(async () => {
  try {
    await connectRabbitMQ();

    app.listen(port, () => {
      console.log(`Publisher service is up and running on port: ${port}`);
    });
  } catch (error) {
    console.error('Publisher service startup error:', error);
    process.exit(1);
  }
})();
