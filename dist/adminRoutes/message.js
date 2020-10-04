"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var user_1 = require("../middlewares/user");
var message_1 = require("../adminControllers/message");
var message_2 = require("../middlewares/message");
var express_validator_1 = require("express-validator");
var router = express_1.Router();
router.post("/admin/message/respond_to_client/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, [
    express_validator_1.check("reply", "Your reply to the client is required").notEmpty(),
    express_validator_1.check("email", "Client's email is required").notEmpty(),
    express_validator_1.check("email", "Please enter a valid email").isEmail(),
], message_1.respondToClient);
router.get("/admin/messages/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, message_1.getMessages);
router.get("/admin/message/:messageId/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, message_1.getMessage);
router.get("/admin/messages_total_count/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, message_1.getTotalMessagesNumber);
router.put("/admin/message/:messageId/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, [
    express_validator_1.check("checked", "Checked is required").notEmpty(),
    express_validator_1.check("checked", "Checked must be true or false").isBoolean(),
], message_1.updateMessage);
router.delete("/admin/message/:messageId/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, message_1.deleteMessage);
router.param("messageId", message_2.messageById);
router.param("userId", user_1.userById);
exports.default = router;
