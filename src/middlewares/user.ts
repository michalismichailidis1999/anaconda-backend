import { Request, Response, NextFunction } from "express";
import db from "../config/db";
import { MysqlError } from "mysql";
import { verify } from "jsonwebtoken";

export const userById = (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) => {
  try {
    let query = `SELECT * FROM users WHERE id='${id}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res.status(404).json({ error: "User does not exist" });
      }

      req.user = result[0];

      req.user.password = undefined;
      req.user.created_at = undefined;

      next();
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const requireSignIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let auth = req.headers.authorization?.split(" ")[1];

    if (!auth) {
      return res.status(401).json({ error: "User not authorized" });
    }

    let secret = process.env.JSON_SECRET || "secret";

    verify(auth, secret, (err, decoded) => {
      if (err) throw err;

      if (typeof decoded === "string") {
        req.auth = decoded;
      }

      next();
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.id !== req.auth) {
      return res
        .status(401)
        .json({ error: "User not authorized. False credentials" });
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== 1) {
      return res
        .status(401)
        .json({ message: "User not authorized. Admin area" });
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
