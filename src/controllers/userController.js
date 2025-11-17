import jwt from 'jsonwebtoken';
import User from '../modules/userModel.js';
import AppError from '../util/appError.js';
import catchAsync from '../util/catchAsync.js';

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;
  user.passwordChangedAt = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

export const register = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email, active: true }).select('+password');

  if (!user) return next(new AppError('No user found with this email!', 404));

  if (!(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 400));
  }

  createSendToken(user, 200, res);
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id, active: true });

  if (!user) {
    return next(new AppError('No user found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const deactivateUser = catchAsync(async (req, res, next) => {
  await User.findOneAndUpdate({ _id: req.user._id }, { active: false });

  res.status(201).json({
    status: 'success',
    message: 'User account is deactivated, you have 30 days to reactivate',
    data: null,
  });
});

export const reactivateuser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  if (!(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 400);
  }

  user.active = true;
  await user.save();

  res.status(201).json({
    status: 'success',
    message: 'User account reactivated successfully.',
    data: { user },
  });
});
