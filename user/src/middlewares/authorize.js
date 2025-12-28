import AppError from "../util/appError.js";

export const authorizeUser = (req, _res, next) => {
  if (req.user.role !== "user") {
    return next(new AppError("You do not have permission to perform this action.", 403));
  }

  next();
};

export const authorizeAdmin = (req, _res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("You do not have permission to perform this action.", 403));
  }

  next();
};
