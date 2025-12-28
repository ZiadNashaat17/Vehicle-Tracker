import Chat from "../models/chatModel.js";
import Messages from "../models/messageModel.js";
// import { getIO } from "../services/socket.js";
import AppError from "../util/appError.js";

// biome-ignore lint/correctness/noUnusedFunctionParameters: <>
export const createMessage = async (req, res, next) => {
  const { receiverId, message } = req.body;
  const senderId = req.user._id;

  let chat = await Chat.findOne({ userIds: { $all: [senderId, receiverId], $size: 2 } });

  if (!chat) {
    chat = await Chat.create({ userIds: [senderId, receiverId] });
  }

  const newMessage = await Messages.create({
    chatId: chat._id,
    senderId,
    receiverId,
    message,
  });

  chat.lastMessage = newMessage._id;
  await chat.save();

  await newMessage.populate("senderId", "name status");
  await newMessage.populate("receiverId", "name status");

  // Emit to socket room
  // const io = getIO();
  // io.to(chat._id.toString()).emit("new-message", {
  // 	chatId: chat._id,
  // 	message: newMessage,
  // });

  res.status(201).json({
    status: "success",
    data: { message: newMessage },
  });
};

export const getMessages = async (req, res, next) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const chat = await Chat.findById(chatId);

  if (!chat || !chat.userIds.includes(req.user._id)) {
    return next(new AppError("You don't have access for this chat!", 403));
  }

  const messages = await Messages.find({ chatId: req.params.chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId", "name")
    .populate("receiverId", "name");

  const total = await Messages.countDocuments({ chatId });

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    },
  });
};

export const markAsRead = async (req, res, next) => {
  const message = await Messages.findById(req.params.messageId);

  if (!message) {
    return next(new AppError("No message found!", 404));
  }

  if (message.receiverId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only mark messages send to you as read", 403));
  }

  if (!message.seen) {
    message.seen = true;
    message.seenAt = Date.now();
    await message.save();

    // const io = getIO();
    // io.to(message.chatId.toString()).emit("messageRead", {
    // 	messageId: message._id,
    // 	seenAt: message.seenAt,
    // });
  }

  res.status(200).json({
    status: "success",
    message: "message is read!",
    data: { message },
  });
};

export const editMessage = async (req, res, next) => {
  const { newMessage } = req.body;

  const message = await Messages.findById(req.params.messageId);

  if (!message) {
    return next(new AppError("No message found!", 404));
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only edit your own messages!", 403));
  }

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (message.createdAt < fifteenMinutesAgo) {
    return next(new AppError("Cannot edit messages older than 15 minutes"));
  }

  message.message = newMessage;
  message.isEdited = true;
  message.editedAt = Date.now();
  await message.save();

  // const io = getIO();
  // io.to(message.chatId.toString()).emit("messageEdited", {
  // 	messageId: message._id,
  // 	message: message.message,
  // 	editedAt: message.editedAt,
  // });

  res.status(202).json({
    status: "success",
    message: "message updated successfully!",
    data: { message },
  });
};

export const deleteMessage = async (req, res, next) => {
  const message = await Messages.findById(req.params.messageId);

  if (!message) {
    return next(new AppError("No message found!", 404));
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only delete your own messages", 403));
  }

  await message.deleteOne();

  const chat = await Chat.findById(message.chatId);
  if (chat?.lastMessage === message._id) {
    const lastMsg = await Messages.findOne({ chatId: message.chatId }).sort({ createdAt: -1 });

    chat.lastMessage = lastMsg?._id || null;
    await chat.save();
  }

  // const io = getIO();
  // io.to(message.chatId.toString()).emit("messageDeleted", {
  // 	messageId: message._id,
  // 	chatId: message.chatId,
  // });

  res.status(204).json({
    status: "success",
    message: "message deleted successfully!",
    data: null,
  });
};
