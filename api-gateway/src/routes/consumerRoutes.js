import { Router } from "express";
import { getDeviceHistory } from "../controllers/consumerController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.get("/:deviceId/history", authenticate, getDeviceHistory);

export default router;
