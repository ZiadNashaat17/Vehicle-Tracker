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
	}).populate("lastRecord");
	// .cache({ key: req.user._id });

	if (!device) {
		return next(new AppError("No device found with this plate number!!", 404));
	}

	// console.log("req.user", req.user._id);
	// console.log("device.user", device.user);

	// console.log(typeof req.user._id, typeof device.user);

	// console.log("true of false: ", req.user._id.toString() !== device.user.toString());

	if (req.user._id.toString() !== device.user.toString()) {
		return next(new AppError("You're not authorized to access this device!", 401));
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

	const devices = await Device.find(query).cache({ key: req.user._id });

	res.status(200).json({
		status: "success",
		results: devices.length,
		data: { devices },
	});
};

export const updateDevice = async (req, res, next) => {
	const filteredBody = filterObj(req.body, "brand", "model", "year", "type", "status");

	const device = await Device.findOneAndUpdate(
		{ plateNumber: req.params.plateNumber },
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
	const device = await Device.findOne({ plateNumber: req.params.plateNumber });

	if (!device) {
		return next(new AppError("No device found with this id!", 404));
	}

	await Device.findOneAndDelete({ plateNumber: req.params.plateNumber });

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

	// device.lastRecord.lat = record.lat;
	// device.lastRecord.lng = record.lng;
	// // if (record.speed > 0) device.status = 'Moving';

	device.lastRecord = record;

	device.status = record.status ? record.status : record.speed > 0 ? "Moving" : "Parking";

	await device.save();

	console.log("record: ", record);

	// console.log(
	// 	`Updated device ${device._id} location to [${device.lastRecord.lng}, ${device.lastRecord.lat}], speed to: ${device.lastRecord.speed} and status to: ${device.lastRecord.status}`,
	// );

	return device.user;
};
