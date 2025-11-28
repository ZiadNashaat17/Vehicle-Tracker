import { Router } from 'express';
import { trackController } from '../controllers/publisherController.js';

const router = Router();

router.post('/', trackController);

export default router;
