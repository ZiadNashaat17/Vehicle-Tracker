import { isValidObjectId } from "mongoose";

import AppError from "../util/appError.js";

export const validatePrivateChat = (req, res, next) => {
  const { senderId, receiverId } = req.body;

  if (!req.body.chatType) req.body.chatType = "Private";

  if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
    return next(new AppError("Please enter valid Ids", 400));
  }

  if (senderId.toString() === receiverId.toString()) {
    return next(new AppError("Cannot create chat with yourself", 400));
  }

  next();
};

export const validateGroupChat = (req, res, next) => {
  const { userIds } = req.body;

  if (!req.body.chatType || req.body.chatType !== "Group") req.body.chatType = "Group";

  if (!Array.isArray(userIds)) {
    return next(new AppError("User Ids must be of type Array", 400));
  }

  const sanitizedUserIds = [...new Set(userIds)];

  if (sanitizedUserIds.length < 2) {
    return next(new AppError("Group must contain at least 3 users", 400));
  }

  req.body.userIds = sanitizedUserIds;

  next();
};
