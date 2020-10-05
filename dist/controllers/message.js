"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAdminAboutViolation = exports.sendMessage = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
const errorMessageHandler_1 = require("../helpers/errorMessageHandler");
const dotenv_1 = require("dotenv");
const mail_1 = __importDefault(require("@sendgrid/mail"));
dotenv_1.config();
const sgApiKey = process.env.SENDGRID_API_KEY
    ? process.env.SENDGRID_API_KEY
    : "";
mail_1.default.setApiKey(sgApiKey);
const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL : "";
const adminEmail2 = process.env.ADMIN_EMAIL_2 ? process.env.ADMIN_EMAIL_2 : "";
exports.sendMessage = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { firstName, lastName, email, message } = req.body;
        let query = `INSERT INTO messages(first_name, last_name, email, message) VALUES('${firstName}', '${lastName}', '${email}', '${message}')`;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            res.status(201).json({ message: "Message sent successfully to admin" });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.notifyAdminAboutViolation = (req, res) => {
    try {
        const emailData = {
            personalizations: [
                {
                    to: [{ email: adminEmail }],
                },
            ],
            from: {
                email: adminEmail2,
                name: "Anakonta",
            },
            replyTo: { email: adminEmail2, name: "Anakonta" },
            templateId: "d-343e22902cd54c6494252078e87bd1dd",
        };
        mail_1.default.send(emailData).catch((err) => {
            console.log(err);
            return res.status(400).json({ error: err.message });
        });
        res.status(200).json({ message: "Message sent successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
