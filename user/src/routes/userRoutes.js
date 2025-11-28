import { Router } from 'express';
import { getUser } from '../controllers/userController.js';
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  reactivateuser,
  updateUser,
  changePassword,
  deactivateUser,
} from '../controllers/authController.js';
import authenticate from '../middlewares/authenticate.js';
import validateUser from '../controllers/authenticateUser.js';

const router = Router();

router.post('/register', register);
router.get('/verify-email/:verifyToken', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:resetToken', resetPassword);
router.patch('/reactivate-user', reactivateuser);

router.get('/authenticate-user', validateUser);

router.use(authenticate);
router.get('/get-user', getUser);
router.patch('/update-user', updateUser);
router.patch('/change-password', changePassword);
router.patch('/deactivate-user', deactivateUser);

export default router;
