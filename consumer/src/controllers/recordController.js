import Record from '../models/recordModel.js';
import AppError from '../util/appError.js';
import APIFeatures from '../util/apiFeatures.js';

export const getAllRecordsForVehicle = async (req, res, next) => {
  const { deviceId, startDate, endDate } = req.body;

  console.log(req.body);

  if (!deviceId) {
    return next(new AppError('Please provide a device id', 400));
  }

  let features;
  let totalRecords;

  if (startDate && endDate) {
    features = new APIFeatures(
      Record.find({ deviceId, timestamp: { $gte: startDate, $lte: endDate } }),
      req.query
    )
      .filter()
      .sort()
      .limit()
      .paginate();

    totalRecords = await Record.countDocuments({
      deviceId,
      timestamp: { $gte: startDate, $lte: endDate },
    });
  } else {
    features = new APIFeatures(Record.find({ deviceId }), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();

    totalRecords = await Record.countDocuments({ deviceId });
  }

  const records = await features.query;

  res.status(200).json({
    status: 'success',
    total: totalRecords,
    data: {
      deviceId,
      history: records,
    },
  });
};
