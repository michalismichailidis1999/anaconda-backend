import { Request, Response } from "express";
import db from "../config/db";
import { validationResult } from "express-validator";
import { sign } from "jsonwebtoken";
import { genSalt, hash, compare } from "bcryptjs";
import { MysqlError } from "mysql";
import { v4 } from "uuid";
import { config } from "dotenv";
import { errorHandler } from "../helpers/errorMessageHandler";

config();

const Verifier = require("email-verifier");

const emailVerifierApiKey = process.env.EMAIL_VERIFIER_API_KEY || "";

const verifier = new Verifier(emailVerifierApiKey, {
  checkCatchAll: false,
  checkDisposable: true,
  checkFree: false,
  validateDNS: true,
  validateSMTP: true,
  retries: 2,
});

export const signup = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { firstName, lastName, email, password } = req.body;

    let userId = v4();

    let salt = await genSalt(10);

    let encryptedPassword = await hash(password, salt);

    let query = `SELECT * FROM users WHERE email='${email}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length > 0) {
        return res
          .status(400)
          .json({ error: "Email address is already taken" });
      }

      query = `INSERT INTO users(id, first_name, last_name, email, password) VALUES('${userId}','${firstName}', '${lastName}', '${email}', '${encryptedPassword}')`;

      let secret = process.env.JSON_SECRET || "secret";

      db.query(query, (err: MysqlError) => {
        if (err) throw err;

        sign(userId, secret, (err, token) => {
          if (err) throw err;

          query = `
            INSERT INTO user_details(user_id, county, city, address, phone, zipcode)
            VALUES('${userId}', '', '', '', '', '')
          `;

          db.query(query, (err: MysqlError) => {
            if (err) throw err;

            res.status(201).json({
              user: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                email,
              },
              token,
            });
          });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const signin = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { email, password } = req.body;

    let query = `SELECT * FROM users WHERE email='${email}'`;

    db.query(query, async (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "Email address or password is incorrect" });
      }

      let user = result[0];

      let isMatch = await compare(password, user.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "User not authorized. False credentials" });
      }

      let secret = process.env.JSON_SECRET || "secret";

      sign(user.id + "", secret, (err, token) => {
        if (err) throw err;

        res.status(200).json({
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          },
          token,
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateDetails = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { county, city, address, phone, zipcode } = req.body;

    let userId = req.user.id;

    let query = `UPDATE user_details SET county='${county}', city='${city}',
                address='${address}', phone='${phone}', zipcode='${zipcode}'
                WHERE user_id='${req.user.id}' AND id=${req.params.detailsId}`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      query = `SELECT id, county, city, address, phone, zipcode
       FROM user_details WHERE user_id='${userId}' AND id=${req.params.detailsId}`;

      db.query(query, (err: MysqlError, result) => {
        if (err) throw err;

        res.status(201).json(result[0]);
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserDetails = (req: Request, res: Response) => {
  try {
    let query = `
      SELECT id, county, city, address, phone, zipcode 
      FROM user_details WHERE user_id='${req.user.id}'
    `;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const changeUserFirstAndLastNames = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { firstName, lastName } = req.body;

    let query = `UPDATE users SET first_name='${firstName}', last_name='${lastName}'
                  WHERE id='${req.user.id}'`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      res.json({
        message: "User first name and last name updated successfully",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const changeEmail = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { email } = req.body;

    let query = `SELECT * FROM users WHERE email='${email}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length > 0) {
        return res.status(400).json({ error: "Email already taken" });
      }

      query = `UPDATE users SET email='${email}' WHERE id='${req.user.id}'`;

      db.query(query, (err: MysqlError) => {
        if (err) throw err;

        res.json({ message: "Email updated successfully" });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const changePassword = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { password, newPassword } = req.body;

    let query = `SELECT * FROM users WHERE id='${req.user.id}'`;

    db.query(query, async (err: MysqlError, result) => {
      if (err) throw err;

      let isMatch = await compare(password, result[0].password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ error: "False Credentials. User not Authorized" });
      }

      let salt = await genSalt(10);

      let encryptedPassword = await hash(newPassword, salt);

      query = `UPDATE users SET password='${encryptedPassword}' WHERE id='${req.user.id}'`;

      db.query(query, (err: MysqlError) => {
        if (err) throw err;

        res.json({ message: "Password updated successfully" });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const checkIfEmailExists = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { email } = req.body;

    verifier.verify(email, (err: Error, data: any) => {
      if (err) throw err;

      let emailIsValid =
        data.disposableCheck &&
        data.disposableCheck === "false" &&
        data.smtpCheck &&
        data.smtpCheck !== "false" &&
        data.dnsCheck &&
        data.dnsCheck !== "false"
          ? true
          : false;

      res.json(emailIsValid);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
