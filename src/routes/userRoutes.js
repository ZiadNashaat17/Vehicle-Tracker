import { Router } from 'express';
import {
  deactivateUser,
  getUser,
  login,
  reactivateuser,
  register,
} from '../controllers/userController.js';
import authenticate from '../services/authenticate.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/get-user', authenticate, getUser);
router.patch('/deactivate-user', authenticate, deactivateUser);
router.patch('/reactivate-user', reactivateuser);

export default router;
