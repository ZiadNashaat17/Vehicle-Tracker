import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });

client.on('error', err => console.log('User Redis Client Error', err));
client.on('connect', () => console.log('User Redis Client Connected'));

await client.connect();

export const getCachedRecord = async deviceId => {
  const key = `device:${deviceId}`;

  const record = await client.get(key);

  if (!record) {
    return null;
  }

  return JSON.parse(record);
};
