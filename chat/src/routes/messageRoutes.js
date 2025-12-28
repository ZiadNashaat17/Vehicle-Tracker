import { Router } from "express";

import {
  createMessage,
  deleteMessage,
  editMessage,
  getMessages,
  markAsRead,
} from "../controllers/messagesController.js";
import validateMessages from "../middlewares/validateMessages.js";

const router = Router();

router.post("/", validateMessages, createMessage);
router.get("/:chatId", getMessages);
router.patch("/:messageId/read", markAsRead);
router.patch("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);

export default router;
