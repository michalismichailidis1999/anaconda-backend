import { Request, Response } from "express";
import db from "../config/db";
import { MysqlError } from "mysql";
import { v4 } from "uuid";
import { validationResult } from "express-validator";
import { errorHandler } from "../helpers/errorMessageHandler";

export const getProducts = (req: Request, res: Response) => {
  try {
    // ?page=1&filter=price&sortBy=desc&category=(category_id)

    let page = parseInt("" + req.query.page) || 1;
    let filter = req.query.filter || "created_at";
    let sortBy = req.query.sortBy || "ASC";
    let category = req.query.category || "all";
    let limit = req.query.limit || 20;
    let sale = filter === "sale" ? true : false;
    let random = req.query.random ? true : false;

    if (page < 0) {
      return res
        .status(400)
        .json({ error: "Page number must not be negative" });
    }

    let query = `SELECT * FROM products WHERE on_sale=0 ORDER BY ${filter} ${sortBy} LIMIT ${
      (page - 1) * 20
    }, ${limit}`;

    if (category !== "all") {
      query = `SELECT * FROM products WHERE category_id='${category}' AND on_sale=0 
      ORDER BY ${filter} ${sortBy} LIMIT ${(page - 1) * 20}, ${limit}`;
    }

    if (sale) {
      if (category !== "all") {
        query = `SELECT * FROM products WHERE category_id='${category}' AND on_sale=1 
        ORDER BY created_at ${sortBy} LIMIT ${(page - 1) * 20}, ${limit}`;
      } else {
        query = `SELECT * FROM products WHERE on_sale=1 
        ORDER BY created_at ${sortBy} LIMIT ${(page - 1) * 20}, ${limit}`;
      }
    }

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getProduct = (req: Request, res: Response) => {
  try {
    let query = `SELECT * FROM products WHERE id='${req.product.id}'`;

    db.query(query, (err: MysqlError, product) => {
      if (err) throw err;

      query = `SELECT  stars AS star, COUNT(*) AS stars_count
      FROM product_rates WHERE product_id='${req.product.id}' GROUP BY stars;`;

      db.query(query, (err: MysqlError, rates) => {
        if (err) throw err;

        query = `
        SELECT pc.id, pc.user_id, pc.comment, CONCAT(us.first_name, ' ', us.last_name) AS user, pr.stars as rate FROM product_comments pc
        INNER JOIN users us ON pc.user_id=us.id
        LEFT JOIN product_rates pr ON pc.product_id=pr.product_id AND pc.user_id=pr.user_id
        WHERE pc.product_id='${req.product.id}'
        `;

        db.query(query, (err: MysqlError, comments) => {
          if (err) throw err;

          query = `SELECT name FROM categories WHERE id='${req.product.category_id}'`;

          db.query(query, (err: MysqlError, category) => {
            if (err) throw err;

            let userId = req.query.userId || "";

            query = `SELECT stars FROM product_rates 
            WHERE user_id='${userId}' AND product_id='${req.product.id}'`;

            db.query(query, (err: MysqlError, result) => {
              if (err) throw err;

              let rate = 0;

              if (result.length !== 0) {
                rate = result[0].stars;
              }

              res.status(200).json({
                product: product[0],
                rates,
                comments,
                category: category[0].name,
                my_rate: rate
              });
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

export const rateProduct = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(500).json({ error: errorHandler(errors.array()[0]) });
    }

    const { stars } = req.body;

    let query = `INSERT INTO product_rates(stars, user_id, product_id) VALUES(${stars}, '${req.user.id}', '${req.product.id}')`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      query = `SELECT (FLOOR(SUM(stars) / COUNT(stars))) as rate FROM product_rates INNER JOIN products ON product_rates.product_id=products.id`;

      db.query(query, (err: MysqlError, result) => {
        if (err) throw err;

        query = `UPDATE products SET rate=${result[0].rate} WHERE id='${req.product.id}'`;

        db.query(query, (err: MysqlError) => {
          if (err) throw err;

          let message = `You have rate product ${req.product.name} ${stars} star`;

          if (stars > 1) {
            message += "s";
          }

          res.status(201).json({ message });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateProductRating = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(500).json({ error: errorHandler(errors.array()[0]) });
    }

    const { stars } = req.body;

    let query = `UPDATE product_rates SET stars=${stars}`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      query = `SELECT (FLOOR(SUM(stars) / COUNT(stars))) as rate FROM product_rates INNER JOIN products ON product_rates.product_id=products.id`;

      db.query(query, (err: MysqlError, result) => {
        if (err) throw err;

        query = `UPDATE products SET rate=${result[0].rate} WHERE id='${req.product.id}'`;

        db.query(query, (err: MysqlError) => {
          if (err) throw err;

          let message = `You have rate product ${req.product.name} ${stars} star`;

          if (stars > 1) {
            message += "s";
          }

          res.status(201).json({ message });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getProductRates = (req: Request, res: Response) => {
  try {
    let query = `SELECT * FROM product_rates WHERE product_id='${req.product.id}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.status(200).json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getProductComments = (req: Request, res: Response) => {
  try {
    let query = `
    SELECT pc.id, pc.comment, pc.user_id, CONCAT(us.first_name, " ", us.last_name) AS user, pr.stars as rate FROM product_comments pc
    INNER JOIN users us ON pc.user_id=us.id
    LEFT JOIN product_rates pr ON pc.product_id=pr.product_id AND pc.user_id=pr.user_id
    WHERE pc.product_id='${req.product.id}'
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

export const createComment = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(500).json({ error: errorHandler(errors.array()[0]) });
    }

    const { comment } = req.body;

    let query = `INSERT INTO product_comments(comment, user_id, product_id) VALUES('${comment}', '${req.user.id}', '${req.product.id}')`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      res.status(201).json({
        message: `Your comment on product ${req.product.name} has been created successfully`
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteComment = (req: Request, res: Response) => {
  try {
    let query = `DELETE FROM product_comments WHERE id=${req.comment.id}`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      res
        .status(200)
        .json({ message: "Your comment has been deleted successfully" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const searchProduct = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(500).json({ error: errorHandler(errors.array()[0]) });
    }

    const { search } = req.body;

    if (search === "empty") {
      res.status(200).json([]);
    }

    let page = parseInt("" + req.query.page) || 1;
    let filter = req.query.filter || "created_at";
    let sortBy = req.query.sortBy || "ASC";
    let category = req.query.category || "all";
    let limit = req.query.limit || 20;
    let sale = filter === "sale" ? true : false;

    if (page < 0) {
      return res
        .status(400)
        .json({ error: "Page number must not be negative" });
    }

    let query = `SELECT * FROM products WHERE on_sale<>1 ORDER BY ${filter} ${sortBy} LIMIT ${
      (page - 1) * 20
    }, ${limit}`;

    if (category !== "all") {
      query = `SELECT * FROM products WHERE category_id='${category} AND on_sale<>1' 
      ORDER BY ${filter} ${sortBy} LIMIT ${(page - 1) * 20}, ${limit}`;
    }

    if (sale) {
      if (category !== "all") {
        query = `SELECT * FROM products WHERE category_id='${category}' AND on_sale=1 
        ORDER BY created_at ${sortBy} LIMIT ${(page - 1) * 20}, ${limit}`;
      } else {
        query = `SELECT * FROM products WHERE on_sale=1 
        ORDER BY created_at ${sortBy} LIMIT ${(page - 1) * 20}, ${limit}`;
      }
    }

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      const regex = new RegExp(search.toLowerCase(), "i");

      let searchedResults = [];

      for (let i = 0; i < result.length; i++) {
        if (regex.test(result[i].name)) {
          searchedResults.push(result[i]);
        }
      }

      res.status(200).json(searchedResults);
    });
  } catch (err) {
    console.log(err);
    res.json({ error: err.message });
  }
};

export const getRecommendations = (req: Request, res: Response) => {
  try {
    let category = req.query.category;

    if (!category) {
      return res
        .status(400)
        .json({ error: "Something went wrong with the request" });
    }

    let query = `SELECT * FROM products WHERE category_id='${category}' ORDER BY RAND() LIMIT 4`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.status(200).json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
