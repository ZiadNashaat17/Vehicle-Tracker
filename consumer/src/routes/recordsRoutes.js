import { Router } from 'express';
import { getAllRecordsForVehicle } from '../controllers/recordController.js';

const router = Router();

router.get('/:deviceId/history', getAllRecordsForVehicle);

export default router;
