import Device from '../models/deviceModel.js';
import AppError from '../util/appError.js';
import filterObj from '../util/filterObj.js';

export const createDevice = async (req, res, next) => {
  req.body.user = req.user._id;

  const device = await Device.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { device },
  });
};

export const getDevice = async (req, res, next) => {
  const device = await Device.findOne({
    user: req.user._id,
    plateNumber: req.params.plateNumber,
  }).cache({ key: req.user._id });

  if (!device) {
    return next(new AppError('No device found with this plate number!!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { device },
  });
};

export const getAllDevices = async (req, res, next) => {
  const status = req.query.status;
  const query = { user: req.user._id };
  if (status) {
    query.status = status;
  }

  const devices = await Device.find(query).cache({ key: req.user._id });

  res.status(200).json({
    status: 'success',
    results: devices.length,
    data: { devices },
  });
};

export const updateDevice = async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'brand', 'model', 'year', 'type', 'status');

  const device = await Device.findOneAndUpdate(
    { plateNumber: req.params.plateNumber },
    filteredBody
  );

  if (!device) {
    return next(new AppError('No device found with this id!', 404));
  }

  res.status(201).json({
    status: 'success',
    data: device,
  });
};

export const deleteDevice = async (req, res, next) => {
  const device = await Device.findOne({ plateNumber: req.params.plateNumber });

  if (!device) {
    return next(new AppError('No device found with this id!', 404));
  }

  await Device.findOneAndDelete({ plateNumber: req.params.plateNumber });

  res.status(204).json({
    status: 'success',
    message: 'Device removed successfully!',
    data: null,
  });
};

export const updateDeviceLastLocation = async record => {
  const device = await Device.findOne({ _id: record.deviceId });

  if (!device) {
    console.error(`Device not found for deviceId: ${record.deviceId}`);
    return;
  }

  device.lastLocation = { type: 'Point', coordinates: [record.lng, record.lat] };
  if (record.speed > 0) device.status = 'Moving';
  device.speed = record.speed;

  await device.save();

  console.log(`Updated device ${device.plateNumber} location to [${record.lng}, ${record.lat}]`);

  return device.user;
};
