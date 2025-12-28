import { Router } from "express";
import * as chatController from "../controllers/chatController.js";
import authenticate from "../middlewares/authenticate.js";
const router = Router();

router.use(authenticate);
router.get("/", chatController.getAllChats);
router.post("/private-chat", chatController.createPrivateChat);
router.post("/group-chat", chatController.createGroupChat);
router.patch("/group/add-user", chatController.addUserToGroup);
router.patch("/group/remove-user", chatController.removeUserFromGroup);

// --------------------------------------------------- //

router.post("/message", chatController.createMessage);
router.get("/message/:chatId", chatController.getMessages);
router.patch("/message/:messageId/read", chatController.markAsRead);
router.patch("/message/:messageId", chatController.editMessage);
router.delete("/message/:messageId", chatController.deleteMessage);

export default router;
