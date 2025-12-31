import axios from "axios";

import AppError from "../util/appError.js";

export default async (req, _res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      return next(new AppError("No token provided. Please log in to get access.", 401));
    }

    const token = req.headers.authorization.split(" ")[1];

    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/user/authenticate-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status !== "success") {
      return next(new AppError("User is not authenticated!", 401));
    }

    console.log("User is authenticated");

    next();
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.message || "Not authenticated",
        error?.response?.status || 401
      )
    );
  }
};
