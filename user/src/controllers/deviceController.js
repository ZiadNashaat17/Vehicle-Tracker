import Device from "../models/deviceModel.js";
import AppError from "../util/appError.js";
import filterObj from "../util/filterObj.js";

export const createDevice = async (req, res, _next) => {
	if (req.user.role !== "admin") {
		req.body.user = req.user._id;
	}

	const device = await Device.create(req.body);

	res.status(201).json({
		status: "success",
		data: { device },
	});
};

export const getDevice = async (req, res, next) => {
	const device = await Device.findOne({
		_id: req.params.deviceId,
		user: req.user._id,
	})
		.populate("user")
		.populate("lastRecord")
		.cache({ key: req.user._id });

	if (!device) {
		return next(new AppError("No device found!", 404));
	}

	res.status(200).json({
		status: "success",
		data: { device },
	});
};

export const getAllDevices = async (req, res, _next) => {
	const status = req.query.status;
	const query = { user: req.user._id };
	if (status) {
		query.status = status;
	}

	const devices = await Device.find(query)
		.cache({ key: req.user._id })
		.populate("user")
		.populate("lastRecord");

	res.status(200).json({
		status: "success",
		results: devices.length,
		data: { devices },
	});
};

export const updateDevice = async (req, res, next) => {
	const filteredBody = filterObj(req.body, "brand", "model", "year", "type", "status");

	const device = await Device.findOneAndUpdate(
		{ _id: req.params.deviceId, user: req.user._id },
		filteredBody,
		{ new: true, runValidators: true },
	);

	if (!device) {
		return next(new AppError("No device found with this id!", 404));
	}

	res.status(201).json({
		status: "success",
		data: { device },
	});
};

export const deleteDevice = async (req, res, next) => {
	const device = await Device.findOneAndDelete({
		_id: req.params.deviceId,
		user: req.user._id,
	});

	if (!device) {
		return next(new AppError("No device found with this id!", 404));
	}

	res.status(204).json({
		status: "success",
		message: "Device removed successfully!",
		data: null,
	});
};

export const updateDeviceLastLocation = async record => {
	const device = await Device.findOne({ _id: record.deviceId });

	if (!device) {
		return next(new AppError("Device not found!", 404));
	}

	device.lastRecord = record;

	device.status = record.status ? record.status : record.speed > 0 ? "Moving" : "Parking";

	await device.save();

	console.log(`Updated device ${device._id} last record to ${record}`);

	return device.user;
};
