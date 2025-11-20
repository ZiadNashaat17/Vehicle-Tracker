import { Router } from 'express';
import {
  createDevice,
  deleteDevice,
  getAllDevices,
  getDevice,
  updateDevice,
} from '../controllers/deviceController.js';
import authenticate from '../../api-gateway/services/authenticate.js';
import authorize from '../../api-gateway/services/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/', getAllDevices);
router.get('/:id', getDevice);
router.post('/', createDevice);
router.patch('/:id', updateDevice);
router.delete('/:id', deleteDevice);

export default router;
