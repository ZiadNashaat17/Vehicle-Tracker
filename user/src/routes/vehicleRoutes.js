import { Router } from 'express';
import {
  addNewVehicle,
  getAllVehicles,
  getVehicle,
  removeVehicle,
  updateVehicle,
} from '../controllers/vehicleController.js';
import authenticate from '../middlewares/authenticate.js';
import cleanCache from '../middlewares/cleanCache.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/:plateNumber', getVehicle);
router.post('/', cleanCache, addNewVehicle);
router.patch('/:plateNumber', cleanCache, updateVehicle);
router.delete('/:plateNumber', cleanCache, removeVehicle);

export default router;
