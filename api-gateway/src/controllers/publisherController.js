import axios from "axios";

import AppError from "../util/appError.js";

export const trackController = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.post(`${process.env.PUBLISHER_SERVICE_URL}/api/track`, req.body, {
			headers: { Authorization: `Bearer ${token}` },
		});

		res.status(201).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.errors.map(el => el.message) ||
					error?.message ||
					"Invalid data format",
				error?.response?.status || 400,
			),
		);
	}
};
