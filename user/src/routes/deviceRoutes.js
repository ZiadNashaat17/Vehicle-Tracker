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

const router = Router();

router.use(authenticate);

router.post("/", cleanCache, createDevice);
router.get("/", getAllDevices);
router.get("/:plateNumber", getDevice);
router.patch("/:plateNumber", cleanCache, updateDevice);
router.delete("/:plateNumber", cleanCache, deleteDevice);

export default router;
