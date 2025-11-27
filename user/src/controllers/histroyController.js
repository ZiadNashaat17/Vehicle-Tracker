import axios from 'axios';

import Vehicle from '../models/vehicleModel.js';
import Device from '../models/deviceModel.js';
import AppError from '../util/appError.js';

const CONSUMER_SERVICE_URL = process.env.CONSUMER_SERVICE_URL || 'http://localhost:3002';

export const getVehicleHistory = async (req, res, next) => {
  const { plateNumber, startDate, endDate } = req.body;

  if (!plateNumber) {
    return next(new AppError('Please provide a plate number', 400));
  }

  const vehicle = await Vehicle.findOne({ plateNumber, user: req.user._id });

  if (!vehicle) {
    return next(new AppError('No vehicle found with this plate number', 404));
  }

  const device = await Device.findOne({ vehicleId: vehicle._id });

  if (!device) {
    return next(new AppError('No device connected with this vehicle!', 400));
  }

  const history = await axios.post(
    `${CONSUMER_SERVICE_URL}/api/consumer/records`,
    { deviceId: device._id, startDate, endDate },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`,
      },
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      history: history.data.history,
    },
  });
};
