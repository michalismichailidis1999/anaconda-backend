"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAdminAboutViolation = exports.sendMessage = void 0;
var db_1 = __importDefault(require("../config/db"));
var express_validator_1 = require("express-validator");
var errorMessageHandler_1 = require("../helpers/errorMessageHandler");
var dotenv_1 = require("dotenv");
var mail_1 = __importDefault(require("@sendgrid/mail"));
dotenv_1.config();
var sgApiKey = process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY : "";
mail_1.default.setApiKey(
  "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"
);
var adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL : "";
var adminEmail2 = process.env.ADMIN_EMAIL_2 ? process.env.ADMIN_EMAIL_2 : "";
exports.sendMessage = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var _a = req.body,
      firstName = _a.firstName,
      lastName = _a.lastName,
      email = _a.email,
      message = _a.message;
    var query =
      "INSERT INTO messages(first_name, last_name, email, message) VALUES('" +
      firstName +
      "', '" +
      lastName +
      "', '" +
      email +
      "', '" +
      message +
      "')";
    db_1.default.query(query, function (err) {
      if (err) throw err;
      res.status(201).json({ message: "Message sent successfully to admin" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.notifyAdminAboutViolation = function (req, res) {
  try {
    var emailData = {
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
    mail_1.default.send(emailData).catch(function (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    });
    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
