import { Router } from "express";
import {
	addUserToGroup,
	createChat,
	createGroupChat,
	getAllChats,
	removeUserFromGroup,
} from "../controllers/chatController.js";
import authenticate from "../middlewares/authenticate.js";
import { validateGroupChat, validatePrivateChat } from "../middlewares/chatValidator.js";

const router = Router();

router.use(authenticate);
router.post("/private-chat", validatePrivateChat, createChat);
router.post("/group-chat", validateGroupChat, createGroupChat);
router.patch("/group/add-user", addUserToGroup);
router.patch("/group/remove-user", removeUserFromGroup);
// router.get("/get-chat/:chatId", getChat);
router.get("/all-chats", getAllChats);

export default router;
