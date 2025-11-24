import { Router } from 'express';
import { getVehicleHistory } from '../controllers/histroyController.js';
import authenticate from '../../services/authenticate.js';

const router = Router();

router.post('/:plateNumber', authenticate, getVehicleHistory);

export default router;
