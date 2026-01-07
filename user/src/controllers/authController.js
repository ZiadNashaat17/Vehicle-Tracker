import jwt from "jsonwebtoken";
import { isValidPhoneNumber } from "libphonenumber-js";
import crypto from "node:crypto";
import { promisify } from "node:util";
import isEmail from "validator/lib/isEmail.js";

import User from "../models/userModel.js";
import sendEmail from "../services/email.js";
import AppError from "../util/appError.js";
import catchAsync from "../util/catchAsync.js";
import filterObj from "../util/filterObj.js";
import generateEmailTemplate from "../util/generateEmailTemplate.js";

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;
  user.passwordChangedAt = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

export const register = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "email",
    "password",
    "passwordConfirm",
    "name",
    "phoneNumber",
    "profilePicture"
  );

  if (filteredBody.password !== filteredBody.passwordConfirm) {
    return next(new AppError("Passwords are not the same!", 400));
  }

  if (!isEmail(filteredBody.email)) {
    return next(new AppError("Enter valid email", 400));
  }

  if (!isValidPhoneNumber(filteredBody.phoneNumber)) {
    return next(new AppError("Invalid phone number", 400));
  }

  delete filteredBody.passwordConfirm;
  const newUser = await User.create(filteredBody);

  const verificationToken = await newUser.generateVerificationToken();
  await newUser.save();

  const verifyURL = `${process.env.BASE_URL}api/user/verify-email/${verificationToken}`;

  const emailTemplate = `
    <h2>Verify Email Request</h2>
    <p>Hi ${newUser.name},</p>
    <p>Click the link below to verify your email:</p>
    <p>${verifyURL}</p>
    <p>This link will expire in 10 minutes.</p>
    <p>Best regards,<br>Vehicle Tracker Team</p>
  `;

  await sendEmail(newUser.email, "Verify Email Request", "Hello", emailTemplate);

  res.status(201).json({
    status: "success",
    message: "User registered successfully! Please check your email inbox to verify your email.",
  });
});

export const verifyEmail = async (req, res, next) => {
  const verificationToken = req.params.verifyToken;

  const hashedVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedVerificationToken,
  });

  if (!user) {
    return next(new AppError("Invalid token"));
  }

  if (user.emailTokenExpires < Date.now()) {
    return next(new AppError("Token expired!", 400));
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
    return next(new AppError("Please provide email and password.", 400));
  }

  const user = await User.findOne({ email, active: true }).select("+password");

  if (!user) return next(new AppError("No user found with this email!", 404));

  if (!(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 400));
  }

  if (!user.isVerified) {
    return next(
      new AppError("Email is not verified! Please verify your email and try again.", 401)
    );
  }

  createSendToken(user, 200, res);
};

export const updateUser = async (req, res, next) => {
  const filteredBody = filterObj(req.body, "name", "email", "profilePicture", "phoneNumber");

  if (req.body.password) {
    return next(new AppError("You cannot update password here!", 400));
  }

  if (filteredBody.email !== undefined) {
    if (!filteredBody.email || filteredBody.email.trim() === "") {
      return next(new AppError("Email cannot be empty!", 400));
    }

    if (!isEmail(filteredBody.email)) {
      return next(new AppError("Invalid email!", 400));
    }

    const existingUser = await User.findOne({
      email: filteredBody.email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return next(new AppError("Email is already in use by another user", 400));
    }
  }

  if (filteredBody.name !== undefined) {
    if (!filteredBody.name || filteredBody.name.trim() === "") {
      return next(new AppError("Name cannot be empty!", 400));
    }
  }

  if (filteredBody.phoneNumber && !isValidPhoneNumber(filteredBody.phoneNumber)) {
    return next(new AppError("Invalid phone number", 400));
  }

  const user = await User.findOneAndUpdate({ _id: req.user._id }, filteredBody, {
    new: true,
    runValidators: true,
  }).select("-_id -__v -role");

  res.status(201).json({
    status: "success",
    message: "Account updated successfully",
    data: { user },
  });
};

export const deactivateUser = async (req, res, _next) => {
  await User.findOneAndUpdate({ _id: req.user._id, isVerified: true }, { active: false });

  res.status(201).json({
    status: "success",
    message: "User account is deactivated, you have 30 days to reactivate",
    data: null,
  });
};

export const reactivateUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("No user found with this email", 404));
  }

  if (!(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError("Incorrect email or password"), 400);
  }

  if (!user.isVerified) {
    return next(
      new AppError("Email is not verified! Please verify your email and try again.", 401)
    );
  }

  user.active = true;
  await user.save();

  res.status(201).json({
    status: "success",
    message: "User account reactivated successfully.",
    data: { user },
  });
};

export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError("Please enter the current password and new password!", 400));
  }

  const user = await User.findOne({ _id: req.user._id }).select("+password");

  if (!(await user.isPasswordCorrect(currentPassword, user.password))) {
    return next(new AppError("The current password you entered is incorrect!", 400));
  }

  if (newPassword !== newPasswordConfirm) {
    return next(new AppError("Passwords are not the same!", 400));
  }

  user.password = newPassword;
  await user.save();

  user.password = undefined;

  res.status(201).json({
    status: "success",
    message: "Password changed successfully!",
    data: { user },
  });
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!isEmail(email)) {
    return next(new AppError("Enter valid email!", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("This email is not registered!", 400));
  }

  if (!user.isVerified) {
    return next(
      new AppError("Email is not verified! Please verify your email and try again.", 401)
    );
  }

  const resetToken = await user.generateResetToken();
  await user.save();

  const resetURL = `${process.env.BASE_URL}reset-password.html?token=${resetToken}`;

  const subject = "Password Reset Request - Vehicle Tracker";
  const buttonText = "Reset Password";
  const messageText =
    "We received a request to reset your password. Click the button below to set a new password for your account. If you didn't request this, you can safely ignore this email.";

  const emailTemplate = generateEmailTemplate(
    user.name,
    resetURL,
    buttonText,
    subject,
    messageText
  );

  await sendEmail(email, "Password Reset Request", "Hello", emailTemplate);

  res.status(200).json({
    status: "success",
    message: "Password reset link sent to your email!",
  });
};

export const resetPassword = async (req, res, next) => {
  const resetToken = req.params.token;
  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords are not the same!", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
  });

  if (!user) {
    return next(new AppError("Invalid token"));
  }

  if (user.passwordResetExpires < Date.now()) {
    return next(new AppError("Token expired!", 400));
  }

  if (!user.isVerified) {
    return next(
      new AppError("Email is not verified! Please verify your email and try again.", 401)
    );
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 201, res);
};

export const authenticateUser = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token || token.trim() === "") {
      return next(new AppError("Please provide a valid authentication token!", 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return next(new AppError("User no longer exists!", 401));
    }

    if (user.passwordChangedAfter(decoded.iat)) {
      return next(new AppError("Password changed after token was issued!", 401));
    }

    if (!user.isVerified) {
      return next(new AppError("This user is not verified!", 401));
    }

    res.status(200).json({
      status: "success",
      message: "User is authenticated!",
      user: { user },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Your token has expired. Please log in again.", 401));
    }
    return next(error);
  }
};
