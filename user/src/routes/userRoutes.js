import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import authenticate from '../middlewares/authenticate.js';

const router = Router();

router.post('/register', userController.register);
router.get('/verify-email/:verifyToken', userController.verifyEmail);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.patch('/reset-password/:resetToken', userController.resetPassword);
router.patch('/reactivate-user', userController.reactivateUser);

router.get('/authenticate-user', userController.authenticateUser);

router.use(authenticate);
router.get('/', userController.getUser);
router.patch('/update-user', userController.updateUser);
router.patch('/change-password', userController.changePassword);
router.patch('/deactivate-user', userController.deactivateUser);
router.get('/logout', userController.logout);

export default router;
