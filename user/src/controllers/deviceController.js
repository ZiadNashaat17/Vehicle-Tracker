import Device from '../models/deviceModel.js';
import AppError from '../util/appError.js';

export const createDevice = async (req, res, next) => {
  req.body.user = req.user._id;
  const newDevice = await Device.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'New device added!',
    data: newDevice,
  });
};

export const getAllDevices = async (req, res, next) => {
  const devices = await Device.find();

  res.status(200).json({
    status: 'success',
    results: devices.length,
    data: devices,
  });
};

export const getDevice = async (req, res, next) => {
  const device = await Device.findOne({ _id: req.params.id });

  if (!device) {
    return next(new AppError('No device found with this Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: device,
  });
};

export const updateDeviceVehicle = async (vehicleId, deviceId) => {
  const device = await Device.findOne({ _id: deviceId });

  if (!device) {
    return new AppError('No device found with this id', 404);
  }

  device.vehicleId = vehicleId;
  await device.save();
};

export const updateDevice = async (req, res, next) => {
  const device = await Device.findOneAndUpdate({ _id: req.params.id }, req.body);

  if (!device) {
    return next(new AppError('No device found with this id', 404));
  }

  res.status(201).json({
    status: 'success',
    data: device,
  });
};

export const deleteDevice = async (req, res, next) => {
  const device = await Device.findOneAndDelete({ _id: req.params.id });

  console.log(device);

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
