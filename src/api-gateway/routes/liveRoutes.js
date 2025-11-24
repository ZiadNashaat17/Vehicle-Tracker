import { Router } from 'express';

import { updateLive } from '../controllers/liveController.js';
import authenticate from '../../services/authenticate.js';

const router = Router();

router.post('/:plateNumber', authenticate, updateLive);

export default router;
