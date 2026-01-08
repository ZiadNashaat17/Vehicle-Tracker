import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import multer from "multer";
import path from "node:path";
import stream from "node:stream";
import sharp from "sharp";

import { LOGGER } from "../logging.js";
import AppError from "../util/appError.js";

const __dirname = import.meta.dirname;
config({ path: path.join(__dirname, "../../", ".env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  // const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|pdf|doc|docx|webm|mp3|wav|m4a/;
  // const mimetype = allowedTypes.test(file.mimetype);

  if (file) {
    cb(null, true);
  } else {
    cb(new AppError("No file found!", 400), false);
  }
};

export const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: multerFilter,
});

export const uploadMedia = fieldName => {
  return upload.single(fieldName);
};

export const resizeUserImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const identifier =
      (req.user && req.user._id) ||
      (req.body && (req.body.email || req.body.username)) ||
      `new-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    const safeId = String(identifier).replace(/[^a-zA-Z0-9-_]/g, "");

    const fileName = `user-${safeId}-${Date.now()}`;

    const buffer = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("png")
      .png({ quality: 90 })
      .toBuffer();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "users",
        public_id: fileName,
        format: "png",
      },
      (error, result) => {
        if (error) return next(new AppError("Error uploading image to cloudinary", 500));

        req.body.profilePicture = result.secure_url;
        next();
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    LOGGER.error("Image upload error:", error);
    return next(new AppError("Error processing or uploading image", 500));
  }
};

export const resizeDeviceImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const identifier =
      (req.user && req.user._id) ||
      (req.body && (req.body.email || req.body.username)) ||
      `new-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    const safeId = String(identifier).replace(/[^a-zA-Z0-9-_]/g, "");

    const fileName = `user-${safeId}-${Date.now()}`;
    const buffer = await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("png")
      .png({ quality: 90 })
      .toBuffer();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "devices",
        public_id: fileName,
        format: "png",
      },
      (error, result) => {
        if (error) return next(new AppError("Error uploading image to cloudinary", 500));

        req.body.image = result.secure_url;
        next();
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    return next(new AppError(error.message, error.statusCode));
  }
};

export const processMessageFile = async (req, res, next) => {
  try {
    const file = req.file;
    const messageType = req.body.messageType || file.mimetype.split("/")[0];

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileExtension = file.originalname.split(".").pop();
    const fileName = file.originalname.split(".").slice(0, -1).join(".");

    // Determine Cloudinary folder and resource type
    let folder = "chat/";
    let resourceType = "auto";

    switch (messageType) {
      case "image":
        folder += "images";
        resourceType = "image";
        break;
      case "video":
        folder += "videos";
        resourceType = "video";
        break;
      case "audio":
        folder += "audio";
        resourceType = "video"; // Cloudinary uses 'video' for audio
        break;
      case "file":
        folder += "file";
        resourceType = "raw";
        break;
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: `${fileName}_${Date.now()}`,
        format: fileExtension,
        ...(resourceType === "raw" && { type: "upload", flags: "attachment" }),
      },
      (error, result) => {
        if (error) {
          return next(new AppError(error.message || "Error uploading file to cloudinary!", 500));
        }

        req.body.mediaUrl = result.secure_url;
        req.body.fileName = fileName;
        req.body.fileSize = file.size;
        req.body.mimeType = file.mimetype;
        req.body.fileExtension = fileExtension;
        // req.body.messageType = file.mimetype.split("/")[0];

        next();
      }
    );

    const bufferStream = new stream.PassThrough();
    uploadStream.end(file.buffer);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    next(error);
  }
};
