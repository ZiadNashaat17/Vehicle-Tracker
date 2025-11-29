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

export default router;
