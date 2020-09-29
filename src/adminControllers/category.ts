import { Request, Response } from "express";
import { MysqlError } from "mysql";
import db from "../config/db";
import { v4 } from "uuid";
import { validationResult } from "express-validator";
import { errorHandler } from "../helpers/errorMessageHandler";

export const create = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { name } = req.body;

    let categoryId = v4();

    let query = `SELECT * FROM categories WHERE name='${name}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length > 0) {
        return res.status(400).json({ message: "Category already exists" });
      }

      query = `INSERT INTO categories(id, name) VALUES('${categoryId}', '${name}')`;

      db.query(query, (err: MysqlError) => {
        if (err) throw err;

        query = `SELECT * FROM categories WHERE id='${categoryId}'`;

        db.query(query, (err: MysqlError, result) => {
          if (err) throw err;

          res.status(201).json({
            message: `Category ${name} has been created`,
            category: result[0]
          });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const remove = (req: Request, res: Response) => {
  try {
    let query = `DELETE FROM categories WHERE id='${req.category.id}'`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      res.status(200).json({
        message: `Category ${req.category.name} has been deleted successfully`
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const update = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { name } = req.body;

    let query = `SELECT * FROM categories WHERE name='${name}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length > 0) {
        return res.status(400).json({ message: "Category already exists" });
      }

      query = `UPDATE categories SET name='${name}' WHERE id='${req.category.id}'`;

      db.query(query, (err: MysqlError) => {
        if (err) throw err;

        res
          .status(200)
          .json({ message: "Category has been updated successfully" });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getTotalCategoriesNumber = (req: Request, res: Response) => {
  try {
    let query = `SELECT COUNT(*) as total FROM categories`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getSalesPerCategory = (req: Request, res: Response) => {
  try {
    let query = `
      SELECT c.name as category, COUNT(*) as total_product_sales FROM order_products as op
      INNER JOIN categories as c ON c.id=op.category_id GROUP BY c.name;
    `;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
