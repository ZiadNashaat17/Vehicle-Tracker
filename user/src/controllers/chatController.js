import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import AppError from "../util/appError.js";

export const createPrivateChat = async (req, res, next) => {
  const senderId = req.user._id;
  const { receiverId, chatType } = req.body;

  let chat = await Chat.findOne({
    chatType,
    userIds: { $all: [senderId, receiverId], $size: 2 },
  });

  if (chat) {
    return res.status(200).json({
      status: "success",
      data: { chat },
    });
  }

  chat = await Chat.create({
    chatType,
    userIds: [senderId, receiverId],
  });

  res.status(201).json({
    status: "success",
    data: {
      chat,
    },
  });
};

export const createGroupChat = async (req, res, next) => {
  const { userIds, chatType, groupName } = req.body;

  const allUserIds = [...userIds, req.user._id];

  let chat = await Chat.findOne({
    chatType,
    userIds: { $all: allUserIds, $size: allUserIds.length },
  });

  if (chat) {
    return res.status(200).json({
      status: "success",
      message: "Group already exists",
      data: { chat },
    });
  }

  chat = await Chat.create({
    chatType,
    userIds: allUserIds,
    groupAdmin: req.user._id,
    groupName,
  });

  res.status(201).json({
    status: "success",
    data: { chat },
  });
};

export const addUserToGroup = async (req, res, next) => {
  const { userId, chatId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat || chat.chatType !== "Group") {
    return next(new AppError("Group not found", 404));
  }

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return next(new AppError("Only group admin can add users", 403));
  }

  if (chat.userIds.includes(userId)) {
    return next(new AppError("User already in group", 400));
  }

  chat.userIds.push(userId);
  await chat.save();
  await chat.populate("userIds", "name email status");

  res.status(201).json({
    status: "success",
    data: { chat },
  });
};

export const removeUserFromGroup = async (req, res, next) => {
  const { userId, chatId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat || chat.chatType !== "Group") {
    return next(new AppError("Group not found", 404));
  }

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return next(new AppError("Only group admin can remove users", 403));
  }

  if (userId.toString() === chat.groupAdmin.toString()) {
    return next(new AppError("Cannot remove group admin", 400));
  }

  if (!chat.userIds.includes(userId)) {
    return next(new AppError("User not in group", 400));
  }

  chat.userIds = chat.userIds.filter(id => id.toString() !== userId.toString());

  if (chat.userIds.length === 1) {
    await chat.deleteOne();
    return res.status(204).json({
      status: "success",
      message: "Group deleted",
      data: null,
    });
  }

  await chat.save();
  await chat.populate("userIds", "name email status");

  res.status(200).json({
    status: "success",
    data: { chat },
  });
};

export const getAllChats = async (req, res, next) => {
  const userId = req.user._id;

  const chats = await Chat.find({ userIds: { $in: userId } }).sort({ updatedAt: -1 });

  const chatsWithUnreadCount = await Promise.all(
    chats.map(async chat => {
      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        receiverId: userId,
        // senderId: { $ne: userId },
        seen: false,
      });

      return {
        ...chat.toObject(),
        unreadCount,
      };
    })
  );

  res.status(200).json({
    status: "success",
    results: chatsWithUnreadCount.length,
    data: { chats: chatsWithUnreadCount },
  });
};
