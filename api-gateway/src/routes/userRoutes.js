import { Router } from "express";
import multer from "multer";
import * as userController from "../controllers/userController.js";
import authenticate from "../middlewares/authenticate.js";

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image")) cb(null, true);
	else cb(new AppError("Not an image! Please upload only images", 400), false);
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

const uploadImage = fieldName => {
	return upload.single(fieldName);
};

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/verify-email/:token", userController.verifyEmail);
router.post("/forgot-password", userController.forgotPassword);
router.patch("/reset-password/:token", userController.resetPassword);
router.patch("/reactivate-user", userController.reactivateUser);

router.use(authenticate);

router.get("/", userController.getUser);
router.get("/all", userController.getAllUsers);
router.patch("/update-user", uploadImage("profilePicture"), userController.updateUser);
router.patch("/change-password", userController.changePassword);
router.patch("/deactivate-user", userController.deactivateUser);
router.get("/logout", userController.logout);

// --------------------------------------------------- //
router.post("/device", userController.createDevice);
router.get("/device", userController.getAllDevices);
router.get("/device/:deviceId", userController.getDevice);
router.patch("/device/:plateNumber", uploadImage("image"), userController.updateDevice);
router.delete("/device/:plateNumber", userController.deleteDevice);
router.get("/device/:deviceId/history", authenticate, userController.getDeviceHistory);

// --------------------------------------------------- //
router.post("/geofence", userController.createGeofence);
router.get("/geofence", userController.getAllGeofences);
router.post("/geofence/check-inside", userController.checkInsideGeofence);
router.get("/geofence/:id/area", userController.getGeofenceArea);
router.get("/geofence/:id", userController.getGeofence);
router.patch("/geofence/:id/disable", userController.disableGeofence);
router.patch("/geofence/:id/recover", userController.recoverGeofence);
router.patch("/geofence/:id", userController.updateGeofence);
router.delete("/geofence/:id", userController.deleteGeofence);

// --------------------------------------------------- //
router.get("/live/:deviceId", userController.trackLive);

export default router;
