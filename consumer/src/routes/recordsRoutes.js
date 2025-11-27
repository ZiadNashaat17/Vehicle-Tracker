import { Router } from 'express';
import { getAllRecordsForVehicle } from '../controllers/recordController.js';
import authenticateUser from '../middlewares/authenticateUser.js';

const router = Router();

router.get('/history', authenticateUser, getAllRecordsForVehicle);

export default router;
