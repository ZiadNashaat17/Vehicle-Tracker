import { Router } from "express";

import {
  addUserToGroup,
  createGroupChat,
  createPrivateChat,
  getAllChats,
  removeUserFromGroup,
} from "../controllers/chatController.js";
import authenticate from "../middlewares/authenticate.js";
import { validateGroupChat, validatePrivateChat } from "../middlewares/chatValidator.js";

const router = Router();

router.use(authenticate);
router.post("/private-chat", validatePrivateChat, createPrivateChat);
router.post("/group-chat", validateGroupChat, createGroupChat);
router.patch("/group/add-user", addUserToGroup);
router.patch("/group/remove-user", removeUserFromGroup);
router.get("/", getAllChats);

export default router;
