import { Router } from 'express';
import { getAllRecordsForVehicle } from '../controllers/recordController.js';

const router = Router();

router.get('/history/:deviceId', getAllRecordsForVehicle);

export default router;
