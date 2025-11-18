import Record from './recordModel.js';
import catchAsync from '../api-gateway/util/catchAsync.js';

export const track = catchAsync(async (req, res, next) => {
  const newRecord = await Record.create(req.body);

  res.status(200).json({
    data: { newRecord },
  });
});
