import { Router } from "express";

import { sendMessage, notifyAdminAboutViolation } from "../controllers/message";
import { check } from "express-validator";

const router = Router();

router.post(
  "/message/send_message",
  [
    check("firstName", "Please enter your first name").notEmpty(),
    check("lastName", "Please enter your last name").notEmpty(),
    check("email", "Please enter your email").notEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("message", "Please enter your message").notEmpty(),
  ],
  sendMessage
);

router.post("/message/notify_admin", notifyAdminAboutViolation);

export default router;
