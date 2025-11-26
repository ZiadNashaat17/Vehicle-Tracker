import redis from 'redis';

const client = redis.createClient({ url: process.env.REDIS_URL });

client.on('error', err => console.log('Consumer Redis Client Error', err));
client.on('connect', () => console.log('Consumer Redis Client Connected'));

await client.connect();

export const cacheLatestRecord = async record => {
  const key = `device:${record.deviceId}`;

  await client.setEx(key, 3600, JSON.stringify(record));
};
