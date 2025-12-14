import { Router } from "express";

import { updateLive } from "../controllers/liveController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.get("/:deviceId", authenticate, updateLive);

export default router;
