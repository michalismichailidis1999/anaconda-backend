import { Router } from "express";
import {
  requireSignIn,
  isAuthenticated,
  isAdmin,
  userById,
} from "../middlewares/user";
import {
  respondToClient,
  getMessages,
  getMessage,
  getTotalMessagesNumber,
  updateMessage,
  deleteMessage,
} from "../adminControllers/message";
import { messageById } from "../middlewares/message";
import { check } from "express-validator";

const router = Router();

router.post(
  "/admin/message/respond_to_client/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  [
    check("reply", "Your reply to the client is required").notEmpty(),
    check("email", "Client's email is required").notEmpty(),
    check("email", "Please enter a valid email").isEmail(),
  ],
  respondToClient
);

router.get(
  "/admin/messages/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getMessages
);

router.get(
  "/admin/message/:messageId/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getMessage
);

router.get(
  "/admin/messages_total_count/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getTotalMessagesNumber
);

router.put(
  "/admin/message/:messageId/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  [
    check("checked", "Checked is required").notEmpty(),
    check("checked", "Checked must be true or false").isBoolean(),
  ],
  updateMessage
);

router.delete(
  "/admin/message/:messageId/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  deleteMessage
);

router.param("messageId", messageById);
router.param("userId", userById);

export default router;
