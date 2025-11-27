import { createClient } from 'redis';

import { updateVehicleLastLocation } from '../controllers/vehicleController.js';

let subClient;

export async function initRedisSubscriber(io) {
  subClient = createClient({ url: process.env.REDIS_URL });
  subClient.on('error', err => console.log('Redis Subscriber Error', err));
  subClient.on('connect', () => console.log('Redis Subscriber Connected'));

  await subClient.connect();

  await subClient.subscribe('new-record', async message => {
    const record = JSON.parse(message);
    console.log('User received record from consumer:', record);

    await updateVehicleLastLocation(record);

    if (io && record.deviceId) {
      const room = `device:${record.deviceId}`;
      io.to(room).emit('vehicle:live', record);
      console.log(`Emitted live update to room: ${room}`);
    }
  });

  console.log('Redis subscriber initialized. listening for records from consumer...');
}
