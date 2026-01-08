import { LOGGER } from "../logging.js";
import { clearHash } from "../services/redisCache.js";

export default (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      LOGGER.info("cleaning hash: ", req.user._id);
      clearHash(req.user._id);
    }
  });

  next();
};
