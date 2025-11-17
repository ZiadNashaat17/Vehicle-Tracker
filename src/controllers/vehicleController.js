import Vehicle from '../modules/vehicleModel.js';
import AppError from '../util/appError.js';
import catchAsync from '../util/catchAsync.js';

export const addNewVehicle = catchAsync(async (req, res, next) => {
  const newVehicle = await Vehicle.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { newVehicle },
  });
});

export const getVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id });

  if (!vehicle) {
    return next(new AppError('No vehicle found with this id!!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { vehicle },
  });
});

export const getAllVehicles = catchAsync(async (req, res, next) => {
  const vehicles = await Vehicle.find();

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: { vehicles },
  });
});

export const removeVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id });

  if (!vehicle) {
    return next(new AppError('No vehicle found with this id!', 404));
  }

  await Vehicle.findOneAndDelete({ _id: req.params.id });

  res.status(204).json({
    status: 'success',
    message: 'Vehicle removed successfully!',
    data: null,
  });
});
