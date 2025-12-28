import { Router } from "express";

import validateRecord from "../middlewares/validateRecord.js";
import { trackController } from "./../controllers/trackController.js";

const router = Router();

router.post("/", validateRecord, trackController);

export default router;
