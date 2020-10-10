import { Request, Response, NextFunction } from "express";
import { IncomingForm } from "formidable";
import { set } from "local-storage";
import db from "../config/db";
import { MysqlError } from "mysql";

export const checkForAllFields = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let form = new IncomingForm();
    form.keepExtensions = true;

    let updateProduct = req.query.update === "true" ? true : false;

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Image could not be uploaded" });
      }

      if (
        !fields.category_id ||
        !fields.name ||
        !fields.price ||
        !fields.quantity ||
        !fields.description ||
        !fields.weight ||
        !fields.code
      ) {
        return res.status(400).json({ error: "Please fill in all fields" });
      }

      if (!files.image && !updateProduct) {
        return res.status(400).json({ error: "Please fill in all fields" });
      }

      const product = {
        category_id: "",
        name: "",
        price: 0,
        quantity: 0,
        image: "",
        image2: "",
        image3: "",
        image4: "",
        description: "",
        weight: 0,
        code: "",
        on_sale: 0,
        new_price: 0,
      };

      product.category_id = fields.category_id + "";
      product.name = fields.name + "";
      product.price = parseInt(fields.price + "");
      product.quantity = parseInt(fields.quantity + "");
      product.description = fields.description + "";
      product.weight = parseFloat(fields.weight + "");
      product.code = fields.code + "";

      if (!updateProduct) {
        product.image = files.image.name;
      } else {
        product.image = files.image ? files.image.name : "";

        product.on_sale = parseInt(fields.on_sale + "");
        product.new_price = parseInt(fields.new_price + "");
      }

      product.image2 = files.image2 ? files.image2.name : "";
      product.image3 = files.image3 ? files.image3.name : "";
      product.image4 = files.image4 ? files.image4.name : "";

      set("product", JSON.stringify(product));

      next();
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const productById = (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) => {
  try {
    let query = `SELECT * FROM products WHERE id='${id}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      req.product = result[0];

      next();
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const commentById = (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) => {
  try {
    let query = `SELECT * FROM product_comments WHERE id=${req.params.commentId}`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res.status(404).json({ error: "Comment not found" });
      }

      req.comment = result[0];

      next();
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
