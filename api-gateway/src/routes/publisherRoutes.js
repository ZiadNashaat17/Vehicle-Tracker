import { Router } from "express";

import { trackController } from "../controllers/publisherController.js";

// import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.post("/", trackController);

export default router;
