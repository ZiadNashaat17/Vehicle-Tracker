import { Router } from 'express';
import {
  changePassword,
  getUser,
  login,
  register,
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

export default router;
