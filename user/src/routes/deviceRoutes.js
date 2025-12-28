import { Router } from "express";
import {
  createDevice,
  deleteDevice,
  getAllDevices,
  getDevice,
  updateDevice,
} from "../controllers/deviceController.js";
import { getDeviceHistory } from "../controllers/recordController.js";
import authenticate from "../middlewares/authenticate.js";
import cleanCache from "../middlewares/cleanCache.js";
import { resizeDeviceImage, uploadImage } from "../services/uploadImages.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  cleanCache,
  uploadImage("image"),
  resizeDeviceImage,
  createDevice
);
router.get("/", getAllDevices);
router.get("/:deviceId", getDevice);
router.patch(
  "/:deviceId",
  cleanCache,
  uploadImage("image"),
  resizeDeviceImage,
  updateDevice
);
router.delete("/:deviceId", cleanCache, deleteDevice);
router.get("/:deviceId/history", getDeviceHistory);

export default router;
