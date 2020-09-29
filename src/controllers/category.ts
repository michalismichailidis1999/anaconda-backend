import { Request, Response } from "express";
import { MysqlError } from "mysql";
import db from "../config/db";

export const getCategories = (req: Request, res: Response) => {
  try {
    let query = "SELECT id, name FROM categories";

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.status(200).json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getCategory = (req: Request, res: Response) => {
  try {
    res.status(200).json(req.category);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
