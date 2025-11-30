import axios from 'axios';

import AppError from '../util/appError.js';

export const trackController = async (req, res, next) => {
  try {
    const { deviceId, lat, lng, speed, timestamp } = req.body;

    const response = await axios.post(`${process.env.PUBLISHER_SERVICE_URL}/api/track`, {
      deviceId: deviceId,
      lat: lat,
      lng: lng,
      speed: speed,
      timestamp: timestamp,
    });

    console.log(response.data);

    res.status(201).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error?.response?.data?.errors.map(el => el.message) ||
          error?.message ||
          'Invalid data format',
        error?.response?.status || 400
      )
    );
  }
};
