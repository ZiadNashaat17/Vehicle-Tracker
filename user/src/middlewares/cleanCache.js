import { clearHash } from '../services/redisCache.js';

export default async (req, res, next) => {
  await next();

  clearHash(req.user._id);
};
