import { createServer } from 'http';
import { config } from 'dotenv';
import { connect } from 'mongoose';

import app from './app.js';
import { initializeSocket } from './src/services/websocket.js';
import { initRedisSubscriber } from './src/services/redisChannelSubscribe.js';

config({ path: './config.env' });

const DB = process.env.DATABASE;
const port = process.env.PORT || 3000;
const httpServer = createServer(app);

(async () => {
  try {
    await connect(DB);
    console.log('User service connected to DB successfully!');

    const io = initializeSocket(httpServer);

    await initRedisSubscriber(io);

    httpServer.listen(port, () => {
      console.log(`User service is up and running on port: ${port}`);
    });
  } catch (err) {
    console.error('User service startup error: ', err);
    process.exit(1);
  }
})();
