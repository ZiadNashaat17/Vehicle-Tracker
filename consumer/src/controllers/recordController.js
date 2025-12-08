import Record from '../models/recordModel.js';
import AppError from '../util/appError.js';
import APIFeatures from '../util/apiFeatures.js';

export const getDeviceRecords = async (req, res, next) => {
  const deviceId = req.params.deviceId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  if (!deviceId) {
    return next(new AppError('Please provide a device id', 400));
  }

  const query = { deviceId: deviceId };
  if (startDate && endDate) {
    query.timestamp = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.timestamp = { $gte: startDate };
  } else if (endDate) {
    query.timestamp = { $lte: endDate };
  }

  const features = new APIFeatures(Record.find(query).cache({ key: deviceId }), req.query)
    .filter()
    .limit()
    .sort()
    .paginate();

  const records = await features.query;
  const totalRecords = records.length;

  res.status(200).json({
    status: 'success',
    total: totalRecords,
    data: {
      deviceId,
      history: records,
    },
  });
};
