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

const router = Router();

router.use(authenticate);
router.post('/', createGeofence);
router.get('/', getAllGeofences);
router.get('/:id', getGeofence);
router.patch('/disable-geofence/:id', disableGeofence);
router.patch('/recover-geofence/:id', recoverGeofence);
router.patch('/update-geofence/:id', updateGeofence);
router.post('/check-inside-geofence', checkPointInGeofence);
router.get('/geofence-area/:id', getGeofenceArea);
router.delete('/delete-geofence/:id', deleteGeofence);

export default router;
