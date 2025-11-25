import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';
import authenticate from '../../services/authenticate.js';

const router = Router();

router.post('/register', authController.register);
router.get('/verify-email/:verifyToken', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:resetToken', authController.resetPassword);
router.patch('/reactivate-user', authController.reactivateuser);

router.use(authenticate);
router.get('/get-user', userController.getUser);
router.patch('/update-user', authController.updateUser);
router.patch('/change-password', authController.changePassword);
router.patch('/deactivate-user', authController.deactivateUser);

export default router;
