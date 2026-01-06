import isEmail from "validator/lib/isEmail.js";

import User from "../models/userModel.js";
import { clearHash } from "../services/redisCache.js";
import AppError from "../util/appError.js";
import filterObj from "../util/filterObj.js";

// eslint-disable-next-line no-unused-vars
export const getAllUsers = async (_req, res, next) => {
  const users = await User.find({ active: true, role: "user" });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
};

export const getUser = async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id, active: true });

  if (!user) {
    return next(new AppError("No user found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
};

export const searchUser = async (req, res, next) => {
  const { email } = req.params;

  if (!email) {
    return next(new AppError("Enter email or username to search!", 400));
  }

  const user = await User.findOne({ email, active: true });

  if (!user) {
    return next(new AppError("No user found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
};



// eslint-disable-next-line no-unused-vars
export const logout = async (req, res, next) => {
  clearHash(req.user._id);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
