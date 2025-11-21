import { publishRecord } from '../services/publishToRabbitMQ.js';
import catchAsync from '../../util/catchAsync.js';

export const trackController = catchAsync(async (req, res, next) => {
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
