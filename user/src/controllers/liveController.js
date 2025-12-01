import AppError from '../util/appError.js';
import Device from '../models/deviceModel.js';
import Vehicle from '../models/vehicleModel.js';
import { getCachedRecord } from '../services/redisCache.js';

export const updateLive = async (req, res, next) => {
  if (process.env.NODE_ENV?.trim() === 'development') {
    console.log('updateLive controller');
  }
  const plateNumber = req.params.plateNumber;
  const vehicle = await Vehicle.findOne({ plateNumber });

  if (!vehicle) {
    if (process.env.NODE_ENV?.trim() === 'development') {
      console.log('No vehicle');
    }
    return next(new AppError('No vehicle found with this plate number!', 404));
  }

  if (process.env.NODE_ENV?.trim() === 'development') {
    // console.log('vehicle: ', vehicle);
  }

  const device = await Device.findById(vehicle.deviceId);

  if (!device) {
    if (process.env.NODE_ENV?.trim() === 'development') {
      console.log('No device');
    }
    return next(new AppError('No device found for this vehicle!', 404));
  }

  if (process.env.NODE_ENV?.trim() === 'development') {
    // console.log(device._id);
  }

  const cachedRecord = await getCachedRecord(device._id);

  if (!cachedRecord) {
    return next(new AppError('No live data available for this device!', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Vehicle tracking is live',
    data: {
      deviceId: device._id,
      initialData: cachedRecord,
    },
  });
};
