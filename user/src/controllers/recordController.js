import Device from "../models/deviceModel.js";
import Record from "../models/recordModel.js";
import APIFeatures from "../util/apiFeatures.js";
import AppError from "../util/appError.js";

export const getDeviceHistory = async (req, res, next) => {
  const deviceId = req.params.deviceId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  if (!deviceId) {
    return next(new AppError("Please provide a device id", 400));
  }

  const device = await Device.findOne({
    _id: deviceId,
    user: req.user._id,
  });

  if (!device) {
    return next(new AppError("No device found!", 404));
  }

  const query = { deviceId: deviceId };
  if (startDate && endDate) {
    query.timestamp = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.timestamp = { $gte: startDate };
  } else if (endDate) {
    query.timestamp = { $lte: endDate };
  }

  const features = new APIFeatures(Record.find(query).cache({ key: req.user._id }), req.query)
    .filter()
    .limit()
    .sort()
    .paginate();

  const records = await features.query;
  const totalRecords = records.length;

  res.status(200).json({
    status: "success",
    total: totalRecords,
    data: {
      deviceId,
      history: records,
    },
  });
};
