import User from "../models/userModel.js";
import { clearHash } from "../services/redisCache.js";
import AppError from "../util/appError.js";

// eslint-disable-next-line no-unused-vars
export const getAllUsers = async (req, res, next) => {
  const { name } = req.query;

  let query = {
    _id: { $ne: req.user._id },
    active: true,
    role: "user",
  };

  if (name && name.trim()) {
    query.name = { $regex: name, $options: "i" };
  }

  const users = await User.find(query);

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
};

export const getMe = async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id, active: true });

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
