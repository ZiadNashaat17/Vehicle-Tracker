import AppError from '../util/appError.js';

export default (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have presmission to perform this action.', 403));
    }

    next();
  };
};
