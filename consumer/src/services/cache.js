import mongoose from 'mongoose';
import redis from 'redis';

const client = redis.createClient({ url: process.env.REDIS_URL });
const exec = mongoose.Query.prototype.exec;

client.on('error', err => console.log('Consumer Redis Client Error', err));
client.on('connect', () => console.log('Consumer Redis Client Connected'));

await client.connect();

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.cacheKey = options.key || '';

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = `cache:${this.cacheKey}`;

  const cacheValue = await client.get(key);
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    console.log('Serving from cache:', key);

    return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);

  await client.setEx(key, 300, JSON.stringify(result));

  return result;
};

export const clearHash = async function (deviceId) {
  // Delete all cache keys that start with this deviceId
  const pattern = `cache:${deviceId}:*`;
  const keys = await client.keys(pattern);

  if (keys.length > 0) {
    await client.del(keys);
    console.log(`Cleared ${keys.length} cache entries for device ${deviceId}`);
  }
};

export const cacheLatestRecord = async record => {
  const key = `device:${record.deviceId}`;

  await client.setEx(key, 3600, JSON.stringify(record));
};
