import * as turf from "@turf/turf";

import Geofence from "../models/geofenceModel.js";
import AppError from "../util/appError.js";

export const createGeofence = async (req, res, _next) => {
  const geofence = await Geofence.create(req.filteredBody);

  res.status(201).json({
    status: "success",
    data: { geofence },
  });
};

export const getAllGeofences = async (req, res, _next) => {
  const geofences = await Geofence.find({ user: req.user._id, active: true })
    .populate("devices")
    .populate("user")
    .cache({
      key: req.user._id,
    });

  res.status(200).json({
    status: "success",
    total: geofences.length,
    data: {
      user: req.user._id,
      geofences,
    },
  });
};

export const getGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id, user: req.user._id })
    .populate("devices")
    .populate("user")
    .cache({ key: req.user._id });

  if (!geofence) {
    return next(new AppError("No geofence found with this id", 404));
  }

  res.status(200).json({
    status: "success",
    data: { geofence },
  });
};

export const checkPointInGeofence = async (req, res, next) => {
  const { geofenceId, lng, lat } = req.body;

  const geofence = await Geofence.findOne({ _id: geofenceId, user: req.user._id, active: true });

  if (!geofence) {
    return next(new AppError("No active geofence found with this id", 404));
  }

  const point = turf.point([lng, lat]);
  let isInside = false;

  if (geofence.geofence.type === "Point") {
    const center = turf.point(geofence.geofence.coordinates);
    const radius = geofence.geofence.radius; // in meters
    const distance = turf.distance(point, center, { units: "meters" });
    isInside = distance <= radius;
  } else if (geofence.geofence.type === "Polygon") {
    const polygon = turf.polygon(geofence.geofence.coordinates);
    isInside = turf.booleanPointInPolygon(point, polygon);
  }

  res.status(200).json({
    status: "success",
    data: {
      geofenceId,
      point: [lng, lat],
      isInside,
    },
  });
};

export const getGeofenceArea = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id, user: req.user._id });

  if (!geofence) {
    return next(new AppError("No geofence found with this id", 404));
  }

  let area;

  if (geofence.geofence.type === "Point") {
    area = Math.PI * geofence.geofence.radius ** 2;
  } else if (geofence.geofence.type === "Polygon") {
    const polygon = turf.polygon(geofence.geofence.coordinates);
    area = turf.area(polygon);
  }

  res.status(200).json({
    status: "success",
    data: {
      geofenceId: geofence._id,
      area,
      unit: "square meters",
    },
  });
};

export const disableGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id, user: req.user._id });

  if (!geofence) {
    return next(new AppError("No geofence found with this id", 404));
  }

  geofence.active = false;
  await geofence.save();

  res.status(201).json({
    status: "success",
    message: "Geofence is not active now",
    data: null,
  });
};

export const recoverGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id, user: req.user._id });

  if (!geofence) {
    return next(new AppError("No geofence found with this id", 404));
  }

  geofence.active = true;
  await geofence.save();

  res.status(201).json({
    status: "success",
    message: "Geofence recovered successfully",
    data: { geofence },
  });
};

export const updateGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id, user: req.user._id });

  if (!geofence) {
    return next(new AppError("No geofence found with this id", 404));
  }

  const updatedGeofence = await Geofence.findByIdAndUpdate(req.params.id, req.filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    message: "Geofence updated successfully",
    data: { geofence: updatedGeofence },
  });
};

export const deleteGeofence = async (req, res, next) => {
  const geofence = await Geofence.findOne({ _id: req.params.id, user: req.user._id });

  if (!geofence) {
    return next(new AppError("Cannot find geofence with this id", 404));
  }

  await Geofence.findOneAndDelete({ _id: req.params.id });

  res.status(204).json({
    status: "success",
    message: "Geofence permanently deleted successfully",
    data: null,
  });
};
