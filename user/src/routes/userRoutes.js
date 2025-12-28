import { Router } from "express";
import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import authenticate from "../middlewares/authenticate.js";
import { authorizeAdmin } from "../middlewares/authorize.js";
import { resizeUserImage, uploadImage } from "../services/uploadImages.js";

const router = Router();

router.post(
  "/register",
  uploadImage("profilePicture"),
  resizeUserImage,
  authController.register
);
router.get("/verify-email/:verifyToken", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch("/reactivate-user", authController.reactivateUser);

router.get("/authenticate-user", authController.authenticateUser);

router.use(authenticate);
router.get("/", userController.getUser);
router.get("/all", authorizeAdmin, userController.getAllUsers);
router.patch(
  "/update-user",
  uploadImage("profilePicture"),
  resizeUserImage,
  userController.updateUser
);
router.get("/search-user/:input", userController.searchUser);
router.patch("/change-password", authController.changePassword);
router.patch("/deactivate-user", authController.deactivateUser);
router.get("/logout", userController.logout);

export default router;
