import { z } from "zod";

import { LOGGER } from "../logging.js";
import AppError from "../util/appError.js";

const objectIdSchema = z.string().regex(/^[0-9a-f]{24}$/i, {
  message: "Invalid ObjectId format",
});

const createTextMessageSchema = z.object({
  chatId: objectIdSchema,
  text: z.string(),
  messageType: z.string(),
});

const createMediaMessageSchema = z.object({
  chatId: objectIdSchema,
  mediaUrl: z.string(),
  text: z.string().optional(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  fileExtension: z.string(),
  messageType: z.string(),
});

const getMessagesSchema = z.object({
  chatId: objectIdSchema,
});

const validate = schema => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.issues.map(err => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }

      LOGGER.error({ error, body: req.body });
      return next(new AppError("Validation error", 500));
    }
  };
};

export const validateCreateTextMessage = validate(createTextMessageSchema);
export const validateCreateMediaMessage = validate(createMediaMessageSchema);
