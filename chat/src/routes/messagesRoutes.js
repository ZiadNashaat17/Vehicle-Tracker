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

const router = Router();

router.post("/send-message", authenticate, validateMessages, createMessage);
router.get("/:chatId", authenticate, getMessages);
router.patch("/:messageId/read", authenticate, markAsRead);
router.patch("/:messageId", authenticate, editMessage);
router.delete("/:messageId", authenticate, deleteMessage);

export default router;
