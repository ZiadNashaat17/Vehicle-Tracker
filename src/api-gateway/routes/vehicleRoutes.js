import { Router } from 'express';
import {
  addNewVehicle,
  getAllVehicles,
  getVehicle,
  removeVehicle,
} from '../controllers/vehicleController.js';
import authenticate from '../services/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/:plateNumber', getVehicle);
router.post('/', addNewVehicle);
router.delete('/:plateNumber', removeVehicle);

export default router;
