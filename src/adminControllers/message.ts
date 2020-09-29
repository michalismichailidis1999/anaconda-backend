import { Request, Response } from "express";
import db from "../config/db";
import { validationResult } from "express-validator";
import { MysqlError } from "mysql";
import { errorHandler } from "../helpers/errorMessageHandler";
import { config } from "dotenv";
import sgMail from "@sendgrid/mail";

config();

const sgApiKey = process.env.SENDGRID_API_KEY
  ? process.env.SENDGRID_API_KEY
  : "";

sgMail.setApiKey(sgApiKey);

export const respondToClient = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
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
        email: "mixalismixailidis857@gmail.com",
        name: "Anakonta",
      },
      replyTo: { email: "michalismichailidis1999@gmail.com", name: "Anakonta" },
      templateId: "d-0f425330dd9f417f8b6bb54f897887d8",
    };

    sgMail.send(emailData).catch((err) => {
      console.log(err);
      return res.status(400).json({ error: err.message });
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = (req: Request, res: Response) => {
  try {
    let query = "SELECT * FROM messages";

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.status(200).json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getMessage = (req: Request, res: Response) => {
  try {
    res.status(200).json(req.message);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getTotalMessagesNumber = (req: Request, res: Response) => {
  try {
    let query = `SELECT COUNT(*) as total FROM messages`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
