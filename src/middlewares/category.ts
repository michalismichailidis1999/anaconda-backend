import { Request, Response, NextFunction } from "express";
import { MysqlError } from "mysql";
import db from "../config/db";

export const categoryById = (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) => {
  try {
    let query = `SELECT * FROM categories WHERE id='${id}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      req.category = result[0];

      next();
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
