import { Router } from 'express';
import { getVehicleHistory } from '../controllers/consumerController.js';
import authenticate from '../middlewares/authenticate.js';

const router = Router();

router.get('/:deviceId', authenticate, getVehicleHistory);

export default router;
