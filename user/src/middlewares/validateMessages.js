import Chat from "../models/chatModel.js";
import AppError from "../util/appError.js";

// biome-ignore lint/correctness/noUnusedFunctionParameters: <>
export default async (req, res, next) => {
  const { chatId, messageType, text, mediaUrl } = req.body;
  let { receiverId } = req.body;
  const senderId = req.user._id;

  if (!chatId && !receiverId) {
    return next(new AppError("You must enter either chatId or receiverId"));
  }

  if (chatId && !receiverId) {
    const chat = await Chat.findById(chatId);

    const otherUser = chat.userIds.find(user => {
      const id = user._id || user;
      return id.toString() !== req.user._id.toString();
    });
    receiverId = otherUser?._id ? otherUser._id : otherUser;
    req.body.receiverId = receiverId;
  }

  if (receiverId === senderId.toString()) {
    return next(new AppError("You cannot send message to yourself!", 400));
  }

  if (messageType === "text") {
    if (!text || !text.trim()) {
      return next(new AppError("Message cannot be empty!", 400));
    }
  } else if (messageType && messageType !== "text") {
    if (!mediaUrl) {
      return next(new AppError("Message cannot be empty!", 400));
    }
  }

  next();
};
