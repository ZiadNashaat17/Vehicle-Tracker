import { Router } from 'express';
import {
  addNewVehicle,
  getAllVehicles,
  getVehicle,
  removeVehicle,
  updateVehicle,
} from '../controllers/vehicleController.js';
import authenticate from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/:plateNumber', getVehicle);
router.post('/', addNewVehicle);
router.patch('/:plateNumber', updateVehicle);
router.delete('/:plateNumber', removeVehicle);

export default router;
