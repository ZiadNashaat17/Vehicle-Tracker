import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';
import authenticate from '../services/authenticate.js';

const router = Router();

router.post('/register', authController.register);
router.get('/verify-email/:verificationToken', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/frogot-password', authController.forgotPassword);
router.get('/reset-password/:resetToken', authController.resetPassword);
router.patch('/reactivate-user', authController.reactivateuser);

router.use(authenticate);
router.get('/get-user', userController.getUser);
router.patch('/change-password', authController.changePassword);
router.patch('/deactivate-user', authController.deactivateUser);

export default router;
