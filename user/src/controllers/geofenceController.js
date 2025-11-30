import Geofence from '../models/geofenceModel.js';
import filterObj from '../util/filterObj.js';
import AppError from '../util/appError.js';

export const createGeofence = async (req, res, next) => {
  req.body.user = req.user._id;
  const filteredBody = filterObj(
    req.body,
    'name',
    'user',
    'type',
    'geofence',
    'color',
    'active',
    'devices'
  );

  console.log(filteredBody);

  if (filteredBody.geofence.type === 'Point') {
    if (!Array.isArray(filteredBody.geofence.coordinates) || !filteredBody.geofence.radius) {
      return next(new AppError('Circle must have center point and radius!', 400));
    }
  } else if (filteredBody.geofence.type === 'Polygon') {
    if (
      !Array.isArray(filteredBody.geofence.coordinates) ||
      !Array.isArray(filteredBody.geofence.coordinates[0]) ||
      filteredBody.geofence.coordinates[0].length < 3
    ) {
      return next(
        new AppError('Polygon must have at least 4 points (first and last must be the same)', 400)
      );
    }
  }

  const geofence = await Geofence.create(filteredBody);

  res.status(201).json({
    status: 'success',
    data: geofence,
  });
};

export const getAllGeofences = async (req, res, next) => {
  const geofences = await Geofence.find({ user: req.user._id, active: true });

  const totalGeofences = await Geofence.countDocuments({ user: req.user._id, active: true });

  res.status(200).json({
    status: 'success',
    total: totalGeofences,
    data: {
      user: req.user._id,
      geofences,
    },
  });
};

export const getGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id });

  if (!geofence) {
    return next(new AppError('No geofence found with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    geofence,
  });
};

export const disableGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id });

  if (!geofence) {
    return next(new AppError('No geofence found with this id', 404));
  }

  geofence.active = false;
  await geofence.save();

  res.status(201).json({
    status: 'success',
    message: 'Geofence is not active now',
    geofence,
  });
};

export const recoverGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id });

  if (!geofence) {
    return next(new AppError('No geofence found with this id', 404));
  }

  geofence.active = true;
  await geofence.save();

  res.status(201).json({
    status: 'success',
    message: 'Geofence recovered successfully',
    geofence,
  });
};

export const updateGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id });

  if (!geofence) {
    return next(new AppError('No geofence found with this id', 404));
  }

  const updatedGeofence = await Geofence.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    message: 'Geofence updated successfully',
    updatedGeofence,
  });
};

export const deleteGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id });

  if (!geofence) {
    return next(new AppError('Cannot find geofence with this id', 404));
  }

  await Geofence.findOneAndDelete({ _id: req.params.id });

  res.status(204).json({
    status: 'success',
    message: 'Geofence permantly deleted successfully',
    data: null,
  });
};
