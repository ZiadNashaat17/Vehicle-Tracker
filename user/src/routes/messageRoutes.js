import { Router } from "express";

import {
  createMessage,
  deleteMessage,
  editMessage,
  getMessages,
  markAsRead,
} from "../controllers/messagesController.js";
import authenticate from "../middlewares/authenticate.js";
import validateMessages from "../middlewares/validateMessages.js";
import { processMessageFile, uploadMedia } from "../services/uploadController.js";

const router = Router();

router.use(authenticate);
router.post("/", validateMessages, createMessage);
// router.post("/upload", uploadMedia("file"), uploadMessageFile);
router.post("/media", uploadMedia("file"), processMessageFile, createMessage);
router.get("/:chatId", getMessages);
router.patch("/:messageId/read", markAsRead);
router.patch("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);

export default router;
