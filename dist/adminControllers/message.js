"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalMessagesNumber = exports.deleteMessage = exports.updateMessage = exports.getMessage = exports.getMessages = exports.respondToClient = void 0;
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
exports.respondToClient = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { reply, email } = req.body;
        const emailData = {
            personalizations: [
                {
                    to: [{ email }],
                    dynamicTemplateData: {
                        message: reply,
                    },
                },
            ],
            from: {
                email: adminEmail,
                name: "Anakonta",
            },
            replyTo: { email: adminEmail, name: "Anakonta" },
            templateId: "d-0f425330dd9f417f8b6bb54f897887d8",
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
exports.getMessages = (req, res) => {
    try {
        let all = req.query.all === "" ? true : false;
        let checked = req.query.checked === "" ? true : false;
        let query = "";
        if (all) {
            query = "SELECT * FROM messages";
        }
        else if (checked) {
            query = "SELECT * FROM messages WHERE checked IS TRUE";
        }
        else {
            query = "SELECT * FROM messages WHERE checked IS FALSE";
        }
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            res.status(200).json(result);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getMessage = (req, res) => {
    try {
        res.status(200).json(req.message);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateMessage = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { checked } = req.body;
        let query = `UPDATE messages SET checked=${checked} WHERE id=${req.message.id}`;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            res.json({ message: "Message updated successfully" });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteMessage = (req, res) => {
    try {
        let query = `DELETE FROM messages WHERE id=${req.message.id}`;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            res.json({ message: "Message deleted successfully" });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getTotalMessagesNumber = (req, res) => {
    try {
        let query = `SELECT COUNT(*) as total FROM messages`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            res.json(result[0]);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
