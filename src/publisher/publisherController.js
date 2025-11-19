import Joi from 'joi';
import { publishRecord } from './rabbitMQ.js';
import catchAsync from '../api-gateway/util/catchAsync.js';

const recordSchema = Joi.object({
  vehicleId: Joi.string().required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  speed: Joi.number().min(0).required(),
  timestamp: Joi.number().optional(),
});

export const track = (req, res, next) => {
  const { error, value } = recordSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      errors: error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  req.validatedRecord = value;
  next();
};

export const publishRecordHandler = catchAsync(async (req, res, next) => {
  try {
    const record = req.validatedRecord;

    await publishRecord(record);

    res.status(200).json({
      success: true,
      message: 'Record received and queued for processing',
      data: record,
    });
  } catch (error) {
    console.error('Error in publishRecordHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process record',
      error: error.message,
    });
  }
});
