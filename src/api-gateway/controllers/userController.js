import User from '../models/userModel.js';
import AppError from '../../util/appError.js';
import catchAsync from '../../util/catchAsync.js';

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id, active: true });

  if (!user) {
    return next(new AppError('No user found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});
