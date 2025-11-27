import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import User from '../models/userModel.js';

export default async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'User not valide!',
    });
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findOne({ _id: decoded.id });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User no longer exists!',
    });
  }

  if (user.passwordChangedAfter(decoded.iat)) {
    return res.status(401).json({
      success: false,
      message: 'Password changed after token was issued!',
    });
  }

  if (!user.isVerified) {
    return res.status(401).json({
      success: false,
      message: 'This user is not verified!',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'User is valide!',
  });
};
