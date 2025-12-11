import { Router } from "express";
import { getDeviceRecords } from "../controllers/recordController.js";

const router = Router();

router.get("/:deviceId/history", getDeviceRecords);

export default router;
