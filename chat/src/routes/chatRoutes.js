import { Router } from "express";

import {
  addUserToGroup,
  createGroupChat,
  createPrivateChat,
  getAllChats,
  removeUserFromGroup,
} from "../controllers/chatController.js";
import { validateGroupChat, validatePrivateChat } from "../middlewares/chatValidator.js";

const router = Router();

router.post("/private-chat", validatePrivateChat, createPrivateChat);
router.post("/group-chat", validateGroupChat, createGroupChat);
router.patch("/group/add-user", addUserToGroup);
router.patch("/group/remove-user", removeUserFromGroup);
router.get("/:userId", getAllChats);

export default router;
