import db from "../config/db";
import { Request, Response, NextFunction } from "express";
import { MysqlError } from "mysql";

export const orderById = (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) => {
  try {
    let query = `SELECT * FROM orders WHERE id='${id}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res.status(404).json({ error: "Order does not found" });
      }

      req.order = result[0];

      next();
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
