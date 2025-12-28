import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import multer from "multer";
import path from "node:path";
import stream from "node:stream";
import sharp from "sharp";

import AppError from "../util/appError.js";

const __dirname = import.meta.dirname;
config({ path: path.join(__dirname, "../../", "config.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Not an image! Please upload only images", 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadImage = fieldName => {
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
      .resize(500, 500)
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
    console.error("Image upload error:", error);
    return next(new AppError("Error processing or uploading image", 500));
  }
};

export const resizeDeviceImage = async (req, res, next) => {
  try {
    //   console.log(req.files);

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
