"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalMessagesNumber = exports.deleteMessage = exports.updateMessage = exports.getMessage = exports.getMessages = exports.respondToClient = void 0;
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
exports.respondToClient = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var _a = req.body,
      reply = _a.reply,
      email = _a.email;
    var emailData = {
      personalizations: [
        {
          to: [{ email: email }],
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
exports.getMessages = function (req, res) {
  try {
    var all = req.query.all === "" ? true : false;
    var checked = req.query.checked === "" ? true : false;
    var query = "";
    if (all) {
      query = "SELECT * FROM messages";
    } else if (checked) {
      query = "SELECT * FROM messages WHERE checked IS TRUE";
    } else {
      query = "SELECT * FROM messages WHERE checked IS FALSE";
    }
    db_1.default.query(query, function (err, result) {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getMessage = function (req, res) {
  try {
    res.status(200).json(req.message);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.updateMessage = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var checked = req.body.checked;
    var query =
      "UPDATE messages SET checked=" + checked + " WHERE id=" + req.message.id;
    db_1.default.query(query, function (err) {
      if (err) throw err;
      res.json({ message: "Message updated successfully" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.deleteMessage = function (req, res) {
  try {
    var query = "DELETE FROM messages WHERE id=" + req.message.id;
    db_1.default.query(query, function (err) {
      if (err) throw err;
      res.json({ message: "Message deleted successfully" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getTotalMessagesNumber = function (req, res) {
  try {
    var query = "SELECT COUNT(*) as total FROM messages";
    db_1.default.query(query, function (err, result) {
      if (err) throw err;
      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
