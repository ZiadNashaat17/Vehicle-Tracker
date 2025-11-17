import { Router } from 'express';
import {
  addNewVehicle,
  getAllVehicles,
  getVehicle,
  removeVehicle,
} from '../controllers/vehicleController.js';

const router = Router();

router.get('/', getAllVehicles);
router.get('/:id', getVehicle);
router.post('/', addNewVehicle);
router.delete('/:id', removeVehicle);

export default router;
