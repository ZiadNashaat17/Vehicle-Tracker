import { Router } from 'express';
import { track, publishRecordHandler } from '../controllers/publisherController.js';

const router = Router();

router.post('/track', track, publishRecordHandler);

export default router;
