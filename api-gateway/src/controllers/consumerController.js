import axios from 'axios';

import AppError from '../util/appError.js';

export const getVehicleHistory = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (!deviceId) {
      return next(new AppError('Please enter deviceId', 400));
    }

    const response = await axios.get(
      `${process.env.CONSUMER_SERVICE_URL}/api/consumer/history/${deviceId}`,
      {
        params: { startDate, endDate },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    return next(
      new AppError(
        error.response?.data?.message || 'Error getting the vehicle history!',
        error.response?.status || 500
      )
    );
  }
};
