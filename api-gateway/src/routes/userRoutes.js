import { Router } from 'express';
import {
  changePassword,
  deactivateUser,
  forgotPassword,
  getUser,
  login,
  reactivateUser,
  register,
  resetPassword,
  updateUser,
  verifyEmail,
} from '../controllers/userController.js';
import authenticate from '../middlewares/authenticate.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.get('/get-user', authenticate, getUser);
router.patch('/update-user', authenticate, updateUser);
router.patch('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/deactivate-user', authenticate, deactivateUser);
router.patch('/reactivate-user', reactivateUser);

export default router;
