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

const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL : "";
const adminEmail2 = process.env.ADMIN_EMAIL_2 ? process.env.ADMIN_EMAIL_2 : "";

export const sendMessage = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { firstName, lastName, email, message } = req.body;

    let query = `INSERT INTO messages(first_name, last_name, email, message) VALUES('${firstName}', '${lastName}', '${email}', '${message}')`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      res.status(201).json({ message: "Message sent successfully to admin" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const notifyAdminAboutViolation = (req: Request, res: Response) => {
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
