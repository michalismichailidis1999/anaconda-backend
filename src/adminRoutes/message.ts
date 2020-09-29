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
} from "../adminControllers/message";
import { messageById } from "../middlewares/message";
import { check } from "express-validator";

const router = Router();

router.post(
  "/admin/message/respond_to_client",
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
  "/admin/message",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getMessages
);

router.get(
  "/admin/message/:messageId",
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

router.param("messageId", messageById);
router.param("userId", userById);

export default router;
