import Record from '../../consumer/models/recordModel.js';
import AppError from '../../util/appError.js';
import catchAsync from '../../util/catchAsync.js';
import Vehicle from '../models/vehicleModel.js';
import Device from '../models/deviceModel.js';
import APIFeatures from '../../util/apiFeatures.js';

export const getVehicleHistory = catchAsync(async (req, res, next) => {
  const { plateNumber, startDate, endDate } = req.body;

  if (!plateNumber) {
    return next(new AppError('Please provide a plate number', 400));
  }

  const vehicle = await Vehicle.findOne({ plateNumber });

  if (!vehicle) {
    return next(new AppError('No vehicle found with this plate number', 404));
  }

  const device = await Device.findOne({ user: req.user._id, vehicleId: vehicle._id });

  if (!device) {
    return next(new AppError('You do not have access to this vehicle', 403));
  }

  let features;
  let totalRecords;

  if (startDate && endDate) {
    features = new APIFeatures(
      Record.find({ deviceId: device._id, timestamp: { $gte: startDate, $lte: endDate } }),
      req.query
    )
      .filter()
      .sort()
      .limit()
      .paginate();

    totalRecords = await Record.countDocuments({
      deviceId: device._id,
      timestamp: { $gte: startDate, $lte: endDate },
    });
  } else {
    features = new APIFeatures(Record.find({ deviceId: device._id }), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();

    totalRecords = await Record.countDocuments({ deviceId: device._id });
  }

  const records = await features.query;

  res.status(200).json({
    success: true,
    total: totalRecords,
    data: {
      deviceId: device._id,
      plateNumber: vehicle.plateNumber,
      history: records,
    },
  });
});
