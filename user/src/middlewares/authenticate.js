import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import AppError from '../util/appError.js';
import User from '../models/userModel.js';

export default async (req, res, next) => {
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

  if (!currentUser.isVerified) {
    return next(
      new AppError('Email is not verified! Please verify your email and try again.', 401)
    );
  }

  req.user = currentUser;
  next();
};
