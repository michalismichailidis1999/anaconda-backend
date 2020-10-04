"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var message_1 = require("../controllers/message");
var express_validator_1 = require("express-validator");
var router = express_1.Router();
router.post("/message/send_message", [
    express_validator_1.check("firstName", "Please enter your first name").notEmpty(),
    express_validator_1.check("lastName", "Please enter your last name").notEmpty(),
    express_validator_1.check("email", "Please enter your email").notEmpty(),
    express_validator_1.check("email", "Please enter a valid email").isEmail(),
    express_validator_1.check("message", "Please enter your message").notEmpty(),
], message_1.sendMessage);
router.post("/message/notify_admin", message_1.notifyAdminAboutViolation);
exports.default = router;
