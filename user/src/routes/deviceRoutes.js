import { Router } from "express";
import {
	createDevice,
	deleteDevice,
	getAllDevices,
	getDevice,
	updateDevice,
} from "../controllers/deviceController.js";
import authenticate from "../middlewares/authenticate.js";
import cleanCache from "../middlewares/cleanCache.js";
import { getDeviceHistory } from "../controllers/recordController.js";

const router = Router();

router.use(authenticate);

router.post("/", cleanCache, createDevice);
router.get("/", getAllDevices);
router.get("/:deviceId", getDevice);
router.patch("/:deviceId", cleanCache, updateDevice);
router.delete("/:deviceId", cleanCache, deleteDevice);
router.get("/:deviceId/history", getDeviceHistory);

export default router;
