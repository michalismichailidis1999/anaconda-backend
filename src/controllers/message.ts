import { Request, Response } from "express";
import db from "../config/db";
import { validationResult } from "express-validator";
import { MysqlError } from "mysql";
import { errorHandler } from "../helpers/errorMessageHandler";

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
    res.json({ message: "Boo" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
