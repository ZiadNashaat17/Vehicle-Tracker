import { updateDeviceVehicle } from './deviceController.js';
import Vehicle from '../models/vehicleModel.js';
import AppError from '../util/appError.js';
import filterObj from '../util/filterObj.js';

export const addNewVehicle = async (req, res, next) => {
  req.body.user = req.user._id;
  const newVehicle = await Vehicle.create(req.body);

  updateDeviceVehicle(newVehicle._id, newVehicle.deviceId);

  res.status(201).json({
    status: 'success',
    data: { newVehicle },
  });
};

export const getVehicle = async (req, res, next) => {
  const vehicle = await Vehicle.findOne({
    user: req.user._id,
    plateNumber: req.params.plateNumber,
  })
    .populate('user')
    .cache({ key: req.user._id });

  if (!vehicle) {
    return next(new AppError('No vehicle found with this plate number!!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { vehicle },
  });
};

export const getAllVehicles = async (req, res, next) => {
  const status = req.query.status;
  const query = { user: req.user._id };
  if (status) {
    query.status = status;
  }

  const vehicles = await Vehicle.find(query).populate('user').cache({ key: req.user._id });

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: { vehicles },
  });
};

export const updateVehicle = async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'brand', 'model', 'year', 'type', 'status');

  const vehicle = await Vehicle.findOneAndUpdate(
    { plateNumber: req.params.plateNumber },
    filteredBody
  );

  if (!vehicle) {
    return next(new AppError('No vehicle found with this id!', 404));
  }

  res.status(201).json({
    status: 'success',
    data: vehicle,
  });
};

export const removeVehicle = async (req, res, next) => {
  const vehicle = await Vehicle.findOne({ plateNumber: req.params.plateNumber });

  if (!vehicle) {
    return next(new AppError('No vehicle found with this id!', 404));
  }

  await Vehicle.findOneAndDelete({ plateNumber: req.params.plateNumber });

  res.status(204).json({
    status: 'success',
    message: 'Vehicle removed successfully!',
    data: null,
  });
};

export const updateVehicleLastLocation = async record => {
  const vehicle = await Vehicle.findOne({ deviceId: record.deviceId });

  if (!vehicle) {
    console.error(`Vehicle not found for deviceId: ${record.deviceId}`);
    return;
  }

  vehicle.lastLocation = {
    type: 'Point',
    coordinates: [record.lng, record.lat],
  };

  vehicle.status = 'Moving';

  await vehicle.save();
  console.log(`Updated vehicle ${vehicle.plateNumber} location to [${record.lng}, ${record.lat}]`);

  return vehicle.user;
};
