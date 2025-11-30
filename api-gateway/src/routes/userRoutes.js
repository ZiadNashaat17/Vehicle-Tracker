import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import authenticate from '../middlewares/authenticate.js';

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);
router.patch('/reset-password/:token', userController.resetPassword);
router.patch('/reactivate-user', userController.reactivateUser);

router.use(authenticate);

router.get('/get-user', userController.getUser);
router.patch('/update-user', userController.updateUser);
router.patch('/change-password', userController.changePassword);
router.patch('/deactivate-user', userController.deactivateUser);

// --------------------------------------------------- //
router.post('/vehicle/create-vehicle', userController.createVehicle);
router.get('/vehicle/', userController.getAllVehicles);
router.get('/vehicle/:plateNumber', userController.getVehicleWithPlateNumber);
router.patch('/vehicle/:plateNumber', userController.updateVehicle);
router.delete('/vehicle/:plateNumber', userController.removeVehicle);

// --------------------------------------------------- //
router.post('/device', userController.createDevice);
router.get('/device/:deviceId', userController.getDevice);
router.get('/device', userController.getAllDevices);
router.patch('/device/update-device/:deviceId', userController.updateDevice);
router.delete('/device/delete-device/:deviceId', userController.deleteDevice);

// --------------------------------------------------- //
router.post('/geofence', userController.createGeofence);
router.get('/geofence', userController.getAllGeofences);
router.get('/geofence/:id', userController.getGeofence);
router.patch('/geofence/disable-geofence/:id', userController.disableGeofence);
router.patch('/geofence/recover-geofence/:id', userController.recoverGeofence);
router.patch('/geofence/update-geofence/:id', userController.updateGeofence);
router.delete('/geofence/delete-geofence/:id', userController.deleteGeofence);

// --------------------------------------------------- //
router.get('/live/:plateNumber', userController.trackLive);

export default router;
