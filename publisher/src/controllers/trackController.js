import { publishRecord } from "../services/publishToRabbitMQ.js";
import AppError from "../util/appError.js";

export const trackController = async (req, res, next) => {
  try {
    const record = req.validatedRecord;

    await publishRecord(record);

    res.status(200).json({
      status: "success",
      message: "Record received and queued for processing",
      data: record,
    });
  } catch (error) {
    next(new AppError("Error in publishing record to rabbitmq queue!", 500));
  }
};
