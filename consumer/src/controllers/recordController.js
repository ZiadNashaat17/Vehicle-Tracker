import Record from '../models/recordModel.js';
import AppError from '../util/appError.js';
import APIFeatures from '../util/apiFeatures.js';

export const getAllRecordsForVehicle = async (req, res, next) => {
  const deviceId = req.params.deviceId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  if (!deviceId) {
    return next(new AppError('Please provide a device id', 400));
  }

  let features;
  let totalRecords;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const sort = req.query.sort || '-createdAt';

  if (startDate && endDate) {
    features = new APIFeatures(
      Record.find({ deviceId, timestamp: { $gte: startDate, $lte: endDate } }).cache({
        key: `${deviceId}:${startDate}:${endDate}:${page}:${limit}:${sort}`,
      }),
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
    features = new APIFeatures(
      Record.find({ deviceId }).cache({ key: `${deviceId}:${page}:${limit}:${sort}` }),
      req.query
    )
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
