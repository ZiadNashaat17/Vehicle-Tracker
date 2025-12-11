import { Router } from "express";
import { trackController } from "./../controllers/trackController.js";
import validateRecord from "../middlewares/validateRecord.js";

const router = Router();

router.post("/", validateRecord, trackController);

export default router;
