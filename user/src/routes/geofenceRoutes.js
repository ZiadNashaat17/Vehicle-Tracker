import { Router } from 'express';
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
} from '../controllers/geofenceController.js';
import authenticate from '../middlewares/authenticate.js';
import cleanCache from '../middlewares/cleanCache.js';

const router = Router();

router.use(authenticate);
router.post('/', cleanCache, createGeofence);
router.get('/', getAllGeofences);
router.get('/:id', getGeofence);
router.patch('/disable-geofence/:id', cleanCache, disableGeofence);
router.patch('/recover-geofence/:id', cleanCache, recoverGeofence);
router.patch('/update-geofence/:id', cleanCache, updateGeofence);
router.post('/check-inside-geofence', checkPointInGeofence);
router.get('/geofence-area/:id', getGeofenceArea);
router.delete('/delete-geofence/:id', cleanCache, deleteGeofence);

export default router;
