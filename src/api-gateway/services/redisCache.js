import { createClient } from 'redis';
import AppError from '../../util/appError.js';
import catchAsync from '../../util/catchAsync.js';

const client = createClient({ url: process.env.REDIS_URL });

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

await client.connect();

export const getCachedRecord = catchAsync(async deviceId => {
  const key = `device:${deviceId}`;

  const record = await client.get(key);

  if (!record) {
    return null;
  }

  return JSON.parse(record);
});
