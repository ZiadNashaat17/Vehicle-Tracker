import Device from "../models/deviceModel.js";
import { getCachedRecord } from "../services/redisCache.js";
import AppError from "../util/appError.js";

export const updateLive = async (req, res, next) => {
  const device = await Device.findOne({ _id: req.params.deviceId });

  if (!device) {
    console.log("No device!");

    return next(new AppError("No device found with this plate number!", 404));
  }

  if (device.user.toString() !== req.user._id.toString()) {
    return next(new AppError("You're not authorized to access this device!", 401));
  }

  const cachedRecord = await getCachedRecord(device._id);

  if (!cachedRecord) {
    res.status(404).json({
      status: "fail",
      message: "No live data for this device",
      data: null,
    });
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
