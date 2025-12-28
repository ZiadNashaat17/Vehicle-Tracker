import Device from "../models/deviceModel.js";
import AppError from "../util/appError.js";
import filterObj from "../util/filterObj.js";

export default async (req, _res, next) => {
  req.body.user = req.user._id;

  const filteredBody = filterObj(
    req.body,
    "name",
    "user",
    "type",
    "geofence",
    "color",
    "active",
    "devices"
  );

  // Validate required fields
  if (!filteredBody.geofence || !filteredBody.geofence.type) {
    return next(new AppError("Geofence type is required", 400));
  }

  // Validate devices if provided
  if (filteredBody.devices && filteredBody.devices.length > 0) {
    const correctDevicesCount = await Device.countDocuments({
      _id: { $in: filteredBody.devices },
      user: req.user._id,
    });

    if (correctDevicesCount !== filteredBody.devices.length) {
      return next(new AppError("One or more devices are invalid or do not belong to you", 400));
    }
  }

  if (filteredBody.geofence.type === "Point") {
    if (
      !Array.isArray(filteredBody.geofence.coordinates) ||
      filteredBody.geofence.coordinates[0].length !== 2 ||
      !filteredBody.geofence.radius ||
      filteredBody.geofence.radius < 10 ||
      filteredBody.geofence.radius > 10000
    ) {
      return next(
        new AppError(
          "Circle geofence must have center point (a point must include exactly two values) and radius. Radius must be between 10 and 10,000 meters",
          400
        )
      );
    }
  } else if (filteredBody.geofence.type === "Polygon") {
    if (
      !Array.isArray(filteredBody.geofence.coordinates[0]) ||
      filteredBody.geofence.coordinates[0].some(
        point => !Array.isArray(point) || point.length !== 2
      ) ||
      filteredBody.geofence.coordinates[0].length < 3
    ) {
      return next(new AppError("Polygon geofence must have at least 3 points", 400));
    }

    const ring = filteredBody.geofence.coordinates[0];
    const firstPoint = ring[0];
    const lastPoint = ring[ring.length - 1];

    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      filteredBody.geofence.coordinates[0].push(firstPoint);
    }
  }

  req.filteredBody = filteredBody;

  next();
};
