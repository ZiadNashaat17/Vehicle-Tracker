import { isValidObjectId } from "mongoose";

import AppError from "../util/appError.js";

// biome-ignore lint/correctness/noUnusedFunctionParameters: <>
export default async (req, res, next) => {
  const { receiverId, message } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !isValidObjectId(receiverId)) {
    return next(new AppError("No receiver id found or invalid id!", 400));
  }

  if (receiverId === senderId.toString()) {
    return next(new AppError("You cannot send message to yourself!", 400));
  }

  if (!message || !message.trim()) {
    return next(new AppError("Message cannot be empty!", 400));
  }

  next();
};
