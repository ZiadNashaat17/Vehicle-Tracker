import isEmail from "validator/lib/isEmail.js";

import User from "../models/userModel.js";
import { clearHash } from "../services/redisCache.js";
import AppError from "../util/appError.js";
import filterObj from "../util/filterObj.js";

export const getAllUsers = async (_req, res, _next) => {
	const users = await User.find({ active: true });

	res.status(200).json({
		status: "success",
		results: users.length,
		data: { users },
	});
};

export const getUser = async (req, res, next) => {
	const user = await User.findOne({ _id: req.user._id, active: true });

	if (!user) {
		return next(new AppError("No user found!", 404));
	}

	res.status(200).json({
		status: "success",
		data: { user },
	});
};

export const updateUser = async (req, res, next) => {
	const filteredBody = filterObj(req.body, "name", "email", "profilePicture");

	if (req.body.password) {
		return next(new AppError("You cannot update password here!", 400));
	}

	if (filteredBody.email !== undefined) {
		if (!filteredBody.email || filteredBody.email.trim() === "") {
			return next(new AppError("Email cannot be empty!", 400));
		}

		if (!isEmail(filteredBody.email)) {
			return next(new AppError("Invalid email!", 400));
		}

		const existingUser = await User.findOne({
			email: filteredBody.email,
			_id: { $ne: req.user._id },
		});

		if (existingUser) {
			return next(new AppError("Email is already in use by another user", 400));
		}
	}

	if (filteredBody.name !== undefined) {
		if (!filteredBody.name || filteredBody.name.trim() === "") {
			return next(new AppError("Name cannot be empty!", 400));
		}
	}

	const user = await User.findOneAndUpdate({ _id: req.user._id }, filteredBody, {
		new: true,
		runValidators: true,
	}).select("-_id -__v -role");

	res.status(201).json({
		status: "success",
		message: "Account updated successfully",
		data: { user },
	});
};

export const logout = async (req, res, _next) => {
	clearHash(req.user._id);

	res.status(200).json({
		status: "success",
		message: "Logged out successfully",
	});
};
