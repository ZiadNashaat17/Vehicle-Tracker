import AppError from '../util/appError.js';
import Device from '../models/deviceModel.js';
import Vehicle from '../models/vehicleModel.js';
import { getCachedRecord } from '../services/redisCache.js';

export const updateLive = async (req, res, next) => {
  const { plateNumber } = req.body;
  const vehicle = await Vehicle.findOne({ plateNumber });

  if (!vehicle) {
    return next(new AppError('No vehicle found with this plate number!', 404));
  }

  const device = await Device.findOne({ user: req.user._id, vehicleId: vehicle._id });

  if (!device) {
    return next(new AppError('No device found for this vehicle!', 404));
  }

  const cachedRecord = await getCachedRecord(device._id);

  if (!cachedRecord) {
    return next(new AppError('No live data available for this device!', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Vehicle tracking is live',
    data: {
      deviceId: device._id,
      initialData: cachedRecord,
    },
  });
};
