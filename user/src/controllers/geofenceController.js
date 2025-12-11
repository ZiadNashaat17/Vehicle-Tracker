import * as turf from "@turf/turf";

import Geofence from "../models/geofenceModel.js";
import AppError from "../util/appError.js";
import filterObj from "../util/filterObj.js";

export const createGeofence = async (req, res, next) => {
	req.body.user = req.user._id;
	const filteredBody = filterObj(
		req.body,
		"name",
		"user",
		"type",
		"geofence",
		"color",
		"active",
		"devices",
	);

	if (process.env.NODE_ENV?.trim() === "development") {
		console.log(filteredBody);
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
					400,
				),
			);
		}
	} else if (filteredBody.geofence.type === "Polygon") {
		if (
			!Array.isArray(filteredBody.geofence.coordinates[0]) ||
			filteredBody.geofence.coordinates[0].some(
				point => !Array.isArray(point) || point.length !== 2,
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

	const geofence = await Geofence.create(filteredBody);

	res.status(201).json({
		status: "success",
		data: geofence,
	});
};

export const getAllGeofences = async (req, res, _next) => {
	const geofences = await Geofence.find({ user: req.user._id, active: true }).cache({
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
	const geofence = await Geofence.findOne({ _id: req.params.id }).cache({ key: req.user._id });

	if (!geofence) {
		return next(new AppError("No geofence found with this id", 404));
	}

	res.status(200).json({
		status: "success",
		geofence,
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
	const geofence = await Geofence.findOne({ _id: req.params.id });

	if (!geofence) {
		return next(new AppError("No geofence found with this id", 404));
	}

	geofence.active = false;
	await geofence.save();

	res.status(201).json({
		status: "success",
		message: "Geofence is not active now",
		geofence,
	});
};

export const recoverGeofence = async (req, res, next) => {
	const geofence = await Geofence.findOne({ _id: req.params.id });

	if (!geofence) {
		return next(new AppError("No geofence found with this id", 404));
	}

	geofence.active = true;
	await geofence.save();

	res.status(201).json({
		status: "success",
		message: "Geofence recovered successfully",
		geofence,
	});
};

export const updateGeofence = async (req, res, next) => {
	const geofence = await Geofence.findOne({ _id: req.params.id });

	if (!geofence) {
		return next(new AppError("No geofence found with this id", 404));
	}

	const updatedGeofence = await Geofence.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(201).json({
		status: "success",
		message: "Geofence updated successfully",
		updatedGeofence,
	});
};

export const deleteGeofence = async (req, res, next) => {
	const geofence = await Geofence.findOne({ _id: req.params.id });

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
