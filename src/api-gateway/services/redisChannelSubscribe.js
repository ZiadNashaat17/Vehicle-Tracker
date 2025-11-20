import { createClient } from 'redis';

let subClient;

export async function initRedisSubscriber() {
  // Subscribe to Redis channel
  subClient = createClient({ url: process.env.REDIS_URL });
  subClient.on('error', err => console.log('Redis Subscriber Error', err));

  await subClient.connect();

  // Listen for new records from consumer service
  await subClient.subscribe('newRecord', message => {
    const record = JSON.parse(message);
    console.log('API-Gateway received record from consumer:', record);
    // Process the record here (e.g., store, trigger notifications, etc.)
  });

  console.log('Redis subscriber initialized - listening for records from consumer');
}
