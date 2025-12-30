import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import { getIO } from "../services/socket.js";
import AppError from "../util/appError.js";

// biome-ignore lint/correctness/noUnusedFunctionParameters: <>
// export const createMessage = async (req, res, next) => {
//   const { receiverId, message } = req.body;
//   const senderId = req.user._id;

//   let chat = await Chat.findOne({ userIds: { $all: [senderId, receiverId], $size: 2 } });

//   if (!chat) {
//     chat = await Chat.create({ userIds: [senderId, receiverId] });
//   }

//   const newMessage = await Message.create({
//     chatId: chat._id,
//     senderId,
//     receiverId,
//     message,
//   });

//   chat.lastMessage = newMessage._id;
//   await chat.save();

//   await newMessage.populate("senderId", "name status");
//   await newMessage.populate("receiverId", "name status");

//   // Emit to socket room
//   const io = getIO();
//   io.to(chat._id.toString()).emit("new-message", {
//     chatId: chat._id,
//     message: newMessage,
//   });

//   res.status(201).json({
//     status: "success",
//     data: { message: newMessage },
//   });
// };

export const createMessage = async (req, res, next) => {
  try {
    const { chatId, receiverId, mediaUrl, text, fileName, fileSize, mimeType, messageType } =
      req.body;
    const senderId = req.user._id;

    // Find or create chat
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    } else if (receiverId) {
      chat = await Chat.findOne({
        userIds: { $all: [senderId, receiverId], $size: 2 },
      });

      if (!chat) {
        chat = await Chat.create({ userIds: [senderId, receiverId] });
      }
    } else {
      return next(new AppError("Either chatId or receiverId is required", 400));
    }

    // Normalize sender id to string and verify chat participation robustly
    const senderIdStr = senderId.toString();
    const isParticipant = chat.userIds.some(u => {
      if (!u) return false;
      if (u._id) return u._id.toString() === senderIdStr;
      return u.toString() === senderIdStr;
    });

    if (!isParticipant) {
      return next(new AppError("You don't have access to this chat", 403));
    }

    // Determine the other participant's id (used as receiver fallback)
    const otherUser = chat.userIds.find(u => {
      if (!u) return false;
      if (u._id) return u._id.toString() !== senderIdStr;
      return u.toString() !== senderIdStr;
    });
    const computedReceiverId = receiverId || (otherUser?._id ? otherUser._id : otherUser);

    let newMessage = await Message.create({
      chatId: chat._id,
      senderId,
      receiverId: computedReceiverId,
      messageType,
      text,
      mediaUrl, // Cloudinary URL
      fileName,
      fileSize,
      mimeType,
    });

    // if (messageType === "text") {
    //   newMessage = await Message.create({
    //     chatId: chat._id,
    //     senderId,
    //     receiverId: computedReceiverId,
    //     messageType,
    //     text,
    //   });
    // } else {
    //   // Create message
    //   newMessage = await Message.create({
    //     chatId: chat._id,
    //     senderId,
    //     receiverId: computedReceiverId,
    //     messageType,
    //     text,
    //     mediaUrl, // Cloudinary URL
    //     fileName,
    //     fileSize,
    //     mimeType,
    //   });
    // }

    // Update chat's last message
    chat.lastMessage = newMessage._id;
    await chat.save();

    await newMessage.populate("senderId", "name profilePicture");
    await newMessage.populate("receiverId", "name profilePicture");

    // Emit to socket
    const io = getIO();
    io.to(chat._id.toString()).emit("new-message", {
      chatId: chat._id,
      message: newMessage,
    });

    res.status(201).json({
      status: "success",
      data: { message: newMessage },
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const chat = await Chat.findById(chatId);

  const userIdStr = req.user._id.toString();
  const isParticipant = chat.userIds.some(u => {
    const id = u._id || u;
    return id.toString() === userIdStr;
  });

  if (!isParticipant) {
    return next(new AppError("You don't have access for this chat!", 403));
  }

  const messages = await Message.find({ chatId: req.params.chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId", "name profilePicture")
    .populate("receiverId", "name profilePicture");

  const total = await Message.countDocuments({ chatId });

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
  const message = await Message.findById(req.params.messageId);

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

    const io = getIO();
    io.to(message.chatId.toString()).emit("messageRead", {
      messageId: message._id,
      seenAt: message.seenAt,
    });
  }

  res.status(200).json({
    status: "success",
    message: "message is read!",
    data: { message },
  });
};

export const editMessage = async (req, res, next) => {
  const { newMessage } = req.body;

  const message = await Message.findById(req.params.messageId);

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

  const io = getIO();
  io.to(message.chatId.toString()).emit("messageEdited", {
    messageId: message._id,
    message: message.message,
    editedAt: message.editedAt,
  });

  res.status(202).json({
    status: "success",
    message: "message updated successfully!",
    data: { message },
  });
};

export const deleteMessage = async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError("No message found!", 404));
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only delete your own messages", 403));
  }

  await message.deleteOne();

  const chat = await Chat.findById(message.chatId);
  if (chat?.lastMessage === message._id) {
    const lastMsg = await Message.findOne({ chatId: message.chatId }).sort({ createdAt: -1 });

    chat.lastMessage = lastMsg?._id || null;
    await chat.save();
  }

  const io = getIO();
  io.to(message.chatId.toString()).emit("messageDeleted", {
    messageId: message._id,
    chatId: message.chatId,
  });

  res.status(204).json({
    status: "success",
    message: "message deleted successfully!",
    data: null,
  });
};
