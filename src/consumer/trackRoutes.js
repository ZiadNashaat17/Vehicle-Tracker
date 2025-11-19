import { Router } from 'express';
import { track } from './trackController.js';

const router = Router();

router.post('/', track);

export default router;
