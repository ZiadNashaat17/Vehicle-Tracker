import { Router } from "express";

import {
  checkPointInGeofence,
  createGeofence,
  deleteGeofence,
  disableGeofence,
  getAllGeofences,
  getGeofence,
  getGeofenceArea,
  recoverGeofence,
  updateGeofence,
} from "../controllers/geofenceController.js";
import authenticate from "../middlewares/authenticate.js";
import cleanCache from "../middlewares/cleanCache.js";
import validateGeofence from "../middlewares/validateGeofence.js";

const router = Router();

router.use(authenticate);
router.post("/", cleanCache, validateGeofence, createGeofence);
router.get("/", getAllGeofences);
router.post("/check-point", checkPointInGeofence);
router.get("/:id", getGeofence);
router.get("/:id/area", getGeofenceArea);
router.patch("/:id", cleanCache, validateGeofence, updateGeofence);
router.patch("/:id/disable", cleanCache, disableGeofence);
router.patch("/:id/recover", cleanCache, recoverGeofence);
router.delete("/:id", cleanCache, deleteGeofence);

export default router;
