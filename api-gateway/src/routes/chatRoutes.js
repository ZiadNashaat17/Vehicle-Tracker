import { Router } from "express";
import multer from "multer";

import * as chatController from "../controllers/chatController.js";
import authenticate from "../middlewares/authenticate.js";
import AppError from "../util/appError.js";

const router = Router();

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|pdf|doc|docx|webm|mp3|wav/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    cb(null, true);
  } else {
    cb(new AppError("Not a supported format!", 400), false);
  }
};

export const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: multerFilter,
});

router.use(authenticate);
router.get("/", chatController.getAllChats);
router.post("/private-chat", chatController.createPrivateChat);
router.post("/group-chat", chatController.createGroupChat);
router.patch("/group/add-user", chatController.addUserToGroup);
router.patch("/group/remove-user", chatController.removeUserFromGroup);

// --------------------------------------------------- //

router.post("/message", chatController.createMessage);
router.post("/message/media", upload.single("file"), chatController.createMediaMessage);
router.get("/message/:chatId", chatController.getMessages);
router.patch("/message/:messageId/read", chatController.markAsRead);
router.patch("/message/:messageId", chatController.editMessage);
router.delete("/message/:messageId", chatController.deleteMessage);

export default router;
