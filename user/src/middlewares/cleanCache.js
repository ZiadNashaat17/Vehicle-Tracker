import { clearHash } from '../services/redisCache.js';

export default (req, res, next) => {
  res.on('finish', () => {
    console.log('cleaning hash: ', req.user._id);
    clearHash(req.user._id);
  });

  next();
};
