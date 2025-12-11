import Device from "../models/deviceModel.js";
import { getCachedRecord } from "../services/redisCache.js";
import AppError from "../util/appError.js";

export const updateLive = async (req, res, next) => {
	const plateNumber = req.params.plateNumber;
	const device = await Device.findOne({ plateNumber });

	if (!device) {
		console.log("No device!");

		return next(new AppError("No device found with this plate number!", 404));
	}

	const cachedRecord = await getCachedRecord(device._id);

	if (!cachedRecord) {
		return next(new AppError("No live data available for this device!", 404));
	}

	res.status(200).json({
		status: "success",
		message: "Device tracking is live",
		data: {
			deviceId: device._id,
			initialData: cachedRecord,
		},
	});
};
