import { Request, Response } from "express";
import db from "../config/db";
import { validationResult } from "express-validator";
import { sign } from "jsonwebtoken";
import { compare, hash, genSalt } from "bcryptjs";
import { MysqlError } from "mysql";
import { config } from "dotenv";
import { errorHandler } from "../helpers/errorMessageHandler";
import { v4 } from "uuid";

config();

export const adminLogin = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { email, password } = req.body;

    let query = `SELECT * from users WHERE email='${email}'`;

    db.query(query, async (err: MysqlError, result) => {
      if (err) throw err;

      let user = result[0];

      let isMatch = await compare(password, user.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ error: "False credentials. User not authorized" });
      }

      if (user.role === 0) {
        return res.json(false);
      }

      query = `SELECT * FROM extra_admin_security_lock_admin WHERE id=1`;

      db.query(query, (err: MysqlError, result) => {
        if (err) throw err;

        if (result[0].is_locked === 1) {
          return res.json(false);
        }

        let secret = process.env.JSON_SECRET || "secret";

        sign(user.id + "", secret, (err, token) => {
          if (err) throw err;

          res.status(200).json({
            user: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email
            },
            token
          });
        });
      });
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

export const adminExtraSecurity = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { email, password } = req.body;

    let query = `SELECT * from users WHERE email='${email}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res.status(400).json({ error: "Something went wrong" });
      }

      let user = result[0];

      query = `SELECT * FROM extra_admin_security_password WHERE user_id='${user.id}'`;

      db.query(query, async (err: MysqlError, result) => {
        if (err) throw err;

        if (result.length === 0) {
          return res.status(400).json({ error: "Something went wrong" });
        }

        let extraSecurity = result[0];

        let isMatch = await compare(password, extraSecurity.password);

        if (!isMatch) {
          query = `SELECT * FROM extra_admin_security_lock_admin WHERE id=1`;

          db.query(query, (err: MysqlError, result) => {
            if (err) throw err;

            let newResult = {
              is_locked: result[0].is_locked,
              remaining_tries: parseInt(result[0].remaining_tries) - 1
            };

            if (newResult.remaining_tries === 0) {
              newResult.is_locked = 1;
            }

            query = `UPDATE extra_admin_security_lock_admin 
                    SET is_locked=${newResult.is_locked}, remaining_tries=${newResult.remaining_tries}`;

            db.query(query, (err: MysqlError) => {
              if (err) throw err;

              res.status(200).json(false);
            });
          });
        } else {
          res.status(200).json(true);
        }
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateAdminExtraPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { password } = req.body;

    let salt = await genSalt(10);

    let encryptedPassword = await hash(password, salt);

    let query = `UPDATE extra_admin_security_password SET password='${encryptedPassword}'
    WHERE user_id='${req.user.id}'`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      res.status(201).json({ message: "Password updated successfully" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getAdmins = (req: Request, res: Response) => {
  try {
    let userId = process.env.ADMIN_USER_ID || "";
    let query = `SELECT * FROM users WHERE role='1' AND id!='${userId}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const unlockAdminArea = (req: Request, res: Response) => {
  let query = `UPDATE extra_admin_security_lock_admin SET is_locked=0,remaining_tries=3 WHERE id=1`;

  db.query(query, (err: MysqlError) => {
    if (err) throw err;

    res.json({ message: "Admin area have been unlocked" });
  });
};

export const lockAdminArea = (req: Request, res: Response) => {
  let query = `UPDATE extra_admin_security_lock_admin SET is_locked=1,remaining_tries=0 WHERE id=1`;

  db.query(query, (err: MysqlError) => {
    if (err) throw err;

    res.json({ message: "Admin area have been locked" });
  });
};

export const getAdminAreaCurrentStatus = (req: Request, res: Response) => {
  try {
    let query = `SELECT * FROM extra_admin_security_lock_admin WHERE id=1`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res.status(404).json({ error: "Something went wrong" });
      }

      if (result[0].is_locked === 1) {
        return res.json(true);
      } else {
        return res.json(false);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const createAdmin = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { firstName, lastName, email, password, extraPassword } = req.body;

    let query = `SELECT * FROM users WHERE email='${email}'`;

    db.query(query, async (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length > 0) {
        return res
          .status(400)
          .json({ error: "This email address is already taken" });
      }

      let salt = await genSalt(10);

      let encryptedPassword = await hash(password, salt);

      let userId = v4();

      query = `INSERT INTO users(id, first_name, last_name, email, password, role)
      VALUES('${userId}', '${firstName}', '${lastName}', '${email}', '${encryptedPassword}', 1)`;

      db.query(query, async (err: MysqlError) => {
        if (err) throw err;

        encryptedPassword = await hash(extraPassword, salt);

        query = `SELECT * FROM users WHERE email='${email}'`;

        db.query(query, (err: MysqlError, result) => {
          if (err) throw err;

          let userId = result[0].id;

          query = `INSERT INTO extra_admin_security_password(user_id, password) VALUES('${userId}', '${encryptedPassword}')`;

          db.query(query, (err: MysqlError) => {
            if (err) throw err;

            res.status(201).json({ message: "Admin created" });
          });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteAdmin = (req: Request, res: Response) => {
  try {
    let query = `SELECT * FROM users WHERE id='${req.params.adminId}' AND role=1`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res.status(404).json({ error: "Admin Not Found" });
      }

      query = `DELETE FROM users WHERE id='${req.params.adminId}' and role=1`;

      db.query(query, (err: MysqlError) => {
        if (err) throw err;

        res.status(200).json({ message: "Admin deleted" });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getTotalUsersNumber = (req: Request, res: Response) => {
  try {
    let query = `SELECT COUNT(*) as total FROM users WHERE role!=1`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
