import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/userModel.js';
import AppError from '../util/appError.js';
import isEmail from 'validator/lib/isEmail.js';
import sendEmail from '../util/email.js';
import filterObj from '../util/filterObj.js';
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
  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords are not the same!', 400));
  }

  delete req.body['passwordConfirm'];
  const newUser = await User.create(req.body);

  const verificationToken = await newUser.generateVerificationToken();
  await newUser.save();

  const verifyURL = `${req.protocol}://${req.get(
    'host'
  )}/api/user/verify-email/${verificationToken}`;

  const emailTemplate = `
    <h2>Verify Email Request</h2>
    <p>Hi ${newUser.name},</p>
    <p>Click the link below to verify your email:</p>
    <p>${verifyURL}</p>
    <p>This link will expire in 10 minutes.</p>
    <p>Best regards,<br>Vehicle Tracker Team</p>
  `;

  await sendEmail(newUser.email, 'Verify Email Request', 'Hello', emailTemplate);

  console.log(newUser);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully! Please check your email inbox to verify your email.',
  });
});

export const verifyEmail = async (req, res, next) => {
  const verificationToken = req.params.verifyToken;

  // console.log(verificationToken);

  const hashedVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // console.log({ hashedVerificationToken });

  const user = await User.findOne({
    emailVerificationToken: hashedVerificationToken,
  });

  if (!user) {
    return next(new AppError('Invalid token'));
  }

  if (user.emailTokenExpires < Date.now()) {
    return next(new AppError('Token expired!', 400));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailTokenExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email, active: true }).select('+password');

  if (!user) return next(new AppError('No user found with this email!', 404));

  if (!(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 400));
  }

  if (!user.isVerified) {
    return next(
      new AppError('Email is not verified! Please verify your email and try again.', 401)
    );
  }

  createSendToken(user, 200, res);
};

export const updateUser = async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.body.password) {
    return next(new AppError('You cannot update password here!', 400));
  }

  if (filteredBody.email !== undefined) {
    if (!filteredBody.email || filteredBody.email.trim() === '') {
      return next(new AppError('Email cannot be empty!', 400));
    }

    if (!isEmail(filteredBody.email)) {
      return next(new AppError('Invalid email!', 400));
    }

    const existingUser = await User.findOne({
      email: filteredBody.email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return next(new AppError('Email is already in use by another user', 400));
    }
  }

  if (filteredBody.name !== undefined) {
    if (!filteredBody.name || filteredBody.name.trim() === '') {
      return next(new AppError('Name cannot be empty!', 400));
    }
  }

  const user = await User.findOneAndUpdate({ _id: req.user._id }, filteredBody, {
    new: true,
    runValidators: true,
  }).select('-_id -__v -role');

  res.status(201).json({
    status: 'success',
    message: 'Account updated successfully',
    data: {
      user,
    },
  });
};

export const deactivateUser = async (req, res, next) => {
  await User.findOneAndUpdate({ _id: req.user._id, isVerified: true }, { active: false });

  res.status(201).json({
    status: 'success',
    message: 'User account is deactivated, you have 30 days to reactivate',
    data: null,
  });
};

export const reactivateUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  if (!(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 400);
  }

  if (!user.isVerified) {
    return next(
      new AppError('Email is not verified! Please verify your email and try again.', 401)
    );
  }

  user.active = true;
  await user.save();

  res.status(201).json({
    status: 'success',
    message: 'User account reactivated successfully.',
    data: { user },
  });
};

export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please enter the current password and new password!', 400));
  }

  const user = await User.findOne({ _id: req.user._id }).select('+password');

  if (!(await user.isPasswordCorrect(currentPassword, user.password))) {
    return next(new AppError('The current password you entered is incorrect!', 400));
  }

  if (newPassword !== newPasswordConfirm) {
    return next(new AppError('Passwords are not the same!', 400));
  }

  user.password = newPassword;
  await user.save();

  user.password = undefined;

  res.status(201).json({
    status: 'success',
    message: 'Password changed successfully!',
    data: { user },
  });
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!isEmail(email)) {
    return next(new AppError('Enter valid email!', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('This email is not registered!', 400));
  }

  if (!user.isVerified) {
    return next(
      new AppError('Email is not verified! Please verify your email and try again.', 401)
    );
  }

  const resetToken = await user.generateResetToken();
  await user.save();

  const resetURL = `${req.protocol}://${req.get('host')}/api/user/reset-password/${resetToken}`;

  const emailTemplate = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your password. Click the link below to proceed:</p>
    <p>${resetURL}</p>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best regards,<br>Vehicle Tracker Team</p>
  `;

  await sendEmail(email, 'Password Reset Request', 'Hello', emailTemplate);

  res.status(200).json({
    status: 'success',
    message: 'Password reset link sent to your email!',
  });
};

export const resetPassword = async (req, res, next) => {
  const resetToken = req.params.resetToken;
  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords are not the same!', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
  });

  if (!user) {
    return next(new AppError('Invalid token'));
  }

  if (user.passwordResetExpires < Date.now()) {
    return next(new AppError('Token expired!', 400));
  }

  if (!user.isVerified) {
    return next(
      new AppError('Email is not verified! Please verify your email and try again.', 401)
    );
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 201, res);
};
