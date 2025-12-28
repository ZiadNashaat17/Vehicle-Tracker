import axios from "axios";
import AppError from "../util/appError.js";

export const createPrivateChat = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/chat/private-chat`,
      req.body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};

export const createGroupChat = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/chat/group-chat`,
      req.body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};

export const addUserToGroup = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/chat/group/add-user`,
      req.body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};

export const removeUserFromGroup = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/chat/group/remove-user`,
      req.body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};

export const getAllChats = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/api/chat`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};

// --------------------------------------------------- //

export const createMessage = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/message`,
      req.body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/api/message/:chatId`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.patch(
      `${process.env.USER_SERVICE_URL}/api/message/:messageId/read`,
      req.body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.patch(
      `${process.env.USER_SERVICE_URL}/api/message/:messageId`,
      req.body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.delete(
      `${process.env.USER_SERVICE_URL}/api/message/:messageId`,
      req.body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Request failed",
        error?.response?.status || 500
      )
    );
  }
};
