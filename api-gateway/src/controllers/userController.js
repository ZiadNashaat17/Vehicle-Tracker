import axios from "axios";
import isEmail from "validator/lib/isEmail.js";

import AppError from "../util/appError.js";
import filterObj from "../util/filterObj.js";

export const register = async (req, res, next) => {
	try {
		const response = await axios.post(
			`${process.env.USER_SERVICE_URL}/api/user/register`,
			req.body,
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || error?.message || "Registration failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return next(new AppError("Please enter email and password", 400));
		}

		const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/user/login`, {
			email,
			password,
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || error?.message || "Login failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const verifyEmail = async (req, res, next) => {
	try {
		const verificationToken = req.params.token;

		const response = await axios.get(
			`${process.env.USER_SERVICE_URL}/api/user/verify-email/${verificationToken}`,
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || error?.message || "Email verification failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const getUser = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/user`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(error?.response?.data?.message || "Failed", error?.response?.status || 500),
		);
	}
};

export const getAllUsers = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/user/all`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(error?.response?.data?.message || "Failed", error?.response?.status || 500),
		);
	}
};

export const updateUser = async (req, res, next) => {
	try {
		const filteredBody = filterObj(req.body, "name", "email");

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
		}

		if (filteredBody.name !== undefined) {
			if (!filteredBody.name || filteredBody.name.trim() === "") {
				return next(new AppError("Name cannot be empty!", 400));
			}
		}

		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.patch(
			`${process.env.USER_SERVICE_URL}/api/user/update-user`,
			filteredBody,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Updating failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const changePassword = async (req, res, next) => {
	try {
		const { currentPassword, newPassword, newPasswordConfirm } = req.body;

		if (!currentPassword || !newPassword) {
			return next(new AppError("Please enter the current password and new password!", 400));
		}

		if (newPassword !== newPasswordConfirm) {
			return next(new AppError("Passwords are not the same!", 400));
		}

		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.patch(
			`${process.env.USER_SERVICE_URL}/api/user/change-password`,
			{
				currentPassword,
				newPassword,
				newPasswordConfirm,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Password changing failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;

		if (!email || !isEmail(email)) {
			return next(new AppError("Please enter your email.", 400));
		}

		const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/user/forgot-password`, {
			email,
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const resetPassword = async (req, res, next) => {
	try {
		const { password, passwordConfirm } = req.body;
		const token = req.params.token;

		if (!password || !passwordConfirm) {
			return next(new AppError("Password and password confirm is required", 400));
		}
		if (!token) {
			return next(new AppError("You must enter the token you received", 400));
		}

		if (password !== passwordConfirm) {
			return next(new AppError("Passwords are not the same", 400));
		}

		const response = await axios.patch(
			`${process.env.USER_SERVICE_URL}/api/user/reset-password/${token}`,
			{ password, passwordConfirm },
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const deactivateUser = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.patch(
			`${process.env.USER_SERVICE_URL}/api/user/deactivate-user`,
			{},
			{ headers: { Authorization: `Bearer ${token}` } },
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const reactivateUser = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return next(new AppError("Email and password are required", 400));
		}

		const response = await axios.patch(`${process.env.USER_SERVICE_URL}/api/user/reactivate-user`, {
			email,
			password,
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const logout = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/user/logout`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

// --------------------------------------------------- //

export const createDevice = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/device`, req.body, {
			headers: { Authorization: `Bearer ${token}` },
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const getAllDevices = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/device`, {
			headers: { Authorization: `Bearer ${token}` },
			params: req.query,
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const getDevice = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.get(
			`${process.env.USER_SERVICE_URL}/api/device/${req.params.deviceId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const updateDevice = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const plateNumber = req.params.plateNumber;

		const response = await axios.patch(
			`${process.env.USER_SERVICE_URL}/api/device/${plateNumber}`,
			req.body,
			{ headers: { Authorization: `Bearer ${token}` } },
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const deleteDevice = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const plateNumber = req.params.plateNumber;

		const response = await axios.delete(
			`${process.env.USER_SERVICE_URL}/api/device/${plateNumber}`,
			{ headers: { Authorization: `Bearer ${token}` } },
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

// --------------------------------------------------- //

export const getDeviceHistory = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const deviceId = req.params.deviceId;

		if (!deviceId) {
			return next(new AppError("Please enter deviceId", 400));
		}

		const response = await axios.get(
			`${process.env.USER_SERVICE_URL}/api/device/${deviceId}/history`,
			{
				params: req.query,
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		res.status(200).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error.response?.data?.message || "Error getting the vehicle history!",
				error.response?.status || 500,
			),
		);
	}
};

// --------------------------------------------------- //

export const createGeofence = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/geofence`, req.body, {
			headers: { Authorization: `Bearer ${token}` },
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const getGeofence = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const geofenceId = req.params.id;

		const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/geofence/${geofenceId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const getAllGeofences = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];

		const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/geofence`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const disableGeofence = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const geofenceId = req.params.id;

		const response = await axios.patch(
			`${process.env.USER_SERVICE_URL}/api/geofence/${geofenceId}/disable`,
			{},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const recoverGeofence = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const geofenceId = req.params.id;

		const response = await axios.patch(
			`${process.env.USER_SERVICE_URL}/api/geofence/${geofenceId}/recover`,
			{},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const getGeofenceArea = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const geofenceId = req.params.id;

		const response = await axios.get(
			`${process.env.USER_SERVICE_URL}/api/geofence/${geofenceId}/area`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const checkInsideGeofence = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const { geofenceId, lng, lat } = req.body;

		if (!geofenceId || !lng || !lat) {
			return next(new AppError("Please enter geofence id, longitude and latitude", 400));
		}

		const response = await axios.post(
			`${process.env.USER_SERVICE_URL}/api/geofence/check-point`,
			{ geofenceId, lng, lat },
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const updateGeofence = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const geofenceId = req.params.id;

		const response = await axios.patch(
			`${process.env.USER_SERVICE_URL}/api/geofence/${geofenceId}`,
			req.body,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

export const deleteGeofence = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const geofenceId = req.params.id;

		const response = await axios.delete(
			`${process.env.USER_SERVICE_URL}/api/geofence/${geofenceId}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};

// --------------------------------------------------- //
export const trackLive = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const deviceId = req.params.deviceId;

		const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/live/${deviceId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		res.status(response.status).json(response.data);
	} catch (error) {
		return next(
			new AppError(
				error?.response?.data?.message || "Request failed",
				error?.response?.status || 500,
			),
		);
	}
};
