import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import AppError from '../util/appError.js';
import catchAsync from '../util/catchAsync.js';
import User from '../modules/userModel.js';

export default catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please login and try again.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findOne({ _id: decoded.id });

  if (!currentUser) {
    return next(new AppError('User no longer exists!!', 401));
  }

  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError('Password changed after token was issued! Please login and try again.', 401)
    );
  }

  req.user = currentUser;
  next();
});
