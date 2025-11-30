import { Router } from 'express';
import {
  createDevice,
  deleteDevice,
  getAllDevices,
  getDevice,
  updateDevice,
} from '../controllers/deviceController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/', getAllDevices);
router.get('/:id', getDevice);
router.post('/', createDevice);
router.patch('/:id', updateDevice);
router.delete('/:id', deleteDevice);

export default router;
