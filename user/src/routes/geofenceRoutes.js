import { Router } from 'express';
import {
  createGeofence,
  deleteGeofence,
  disableGeofence,
  getAllGeofences,
  getGeofence,
  recoverGeofence,
} from '../controllers/geofenceController.js';
import authenticate from '../services/authenticate.js';

const router = Router();

router.post('/', authenticate, createGeofence);
router.get('/', authenticate, getAllGeofences);
router.get('/:id', authenticate, getGeofence);
router.patch('/disable-geofence/:id', authenticate, disableGeofence);
router.patch('/recover-geofence/:id', authenticate, recoverGeofence);
router.delete('/delete-geofence/:id', authenticate, deleteGeofence);

export default router;
