import redis from 'redis';
import catchAsync from '../../util/catchAsync.js';

const client = redis.createClient({ url: process.env.REDIS_URL });

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

await client.connect();

export const cacheLatestRecord = catchAsync(async record => {
  const key = `device:${record.deviceId}`;

  await client.setEx(key, 3600, JSON.stringify(record));
});
