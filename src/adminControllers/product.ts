import { Request, Response } from "express";
import db from "../config/db";
import { MysqlError } from "mysql";
import { v4 } from "uuid";
import { get, remove as removeFromStorage } from "local-storage";
import multer, { diskStorage } from "multer";
import { join } from "path";

let destination = join(
  __dirname,
  "../../../",
  "client",
  "src",
  "images",
  "products"
);

// Initialize storage
const storage = diskStorage({
  destination: destination,
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

// Initialize Upload
const upload = multer({
  storage,
}).single("image");

export const create = (req: Request, res: Response) => {
  try {
    if (get("product")) {
      const {
        category_id,
        name,
        price,
        image,
        image2,
        image3,
        image4,
        quantity,
        description,
        code,
        weight,
      } = JSON.parse(get("product"));

      let productId = v4();
      let productName = name;

      let query = `SELECT * FROM products WHERE name='${name}'`;

      db.query(query, (err: MysqlError, result) => {
        if (err) throw err;

        if (result.length > 0) {
          return res.status(400).json({ error: "Product already exists" });
        }

        if (code) {
          query = `INSERT INTO 
        products(id, category_id, name, price, image, image2, image3, image4, quantity, description, code, weight) 
        VALUES('${productId}', '${category_id}', '${name}', ${price}, '${image}', '${image2}', '${image3}', '${image4}', ${quantity}, '${description}', '${code}', ${weight})`;
        } else {
          query = `INSERT INTO 
        products(id, category_id, name, price, image, image2, image3, image4, quantity, description, weight) 
        VALUES('${productId}', '${category_id}', '${name}', ${price}, '${image}', '${image2}', '${image3}', '${image4}', ${quantity}, '${description}', ${weight})`;
        }

        db.query(query, (err: MysqlError) => {
          if (err) throw err;

          removeFromStorage("product");

          res.status(201).json({
            message: `Product ${productName} has been created successfully`,
          });
        });
      });
    } else {
      return res.json({
        error: "Something went wrong. Product could not be created",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const uploadImage = (req: Request, res: Response) => {
  try {
    upload(req, res, () => {
      if (req.file) {
        res.status(200).json({ message: "Image uploaded successfully" });
      } else {
        res.status(400).json({ error: "Image is required" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const update = (req: Request, res: Response) => {
  try {
    if (get("product")) {
      const {
        category_id,
        name,
        price,
        image,
        image2,
        image3,
        image4,
        quantity,
        description,
        code,
        weight,
        on_sale,
        new_price,
      } = JSON.parse(get("product"));

      let productName = name;

      let query = `SELECT image, image2, image3, image4 FROM products WHERE id='${req.product.id}'`;

      db.query(query, (err: MysqlError, result) => {
        if (err) throw err;

        let pImage = image || result[0].image;
        let pImage2 = image2 || result[0].image2;
        let pImage3 = image3 || result[0].image3;
        let pImage4 = image4 || result[0].image4;

        query = `UPDATE products SET
         category_id='${category_id}',
          name='${name}',
          price=${price},
          image='${pImage}',
          image2='${pImage2}',
          image3='${pImage3}',
          image4='${pImage4}',
          code='${code}',
          weight=${weight},
          quantity=${quantity},
          description='${description}',
          on_sale=${on_sale},
          new_price=${new_price},
          updated_at=NOW() WHERE id='${req.product.id}'`;

        db.query(query, (err: MysqlError) => {
          if (err) throw err;

          removeFromStorage("product");

          res.status(201).json({
            message: `Product ${productName} has been updated successfully`,
          });
        });
      });
    } else {
      return res.json({
        error: "Something went wrong. Product could not be updated",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const remove = (req: Request, res: Response) => {
  try {
    let query = `DELETE FROM products WHERE id='${req.product.id}'`;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      res.status(200).json({ message: "Product deleted successfully" });
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
        .json({ message: "Comment has been deleted successfully" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getTotalProductsNumber = (req: Request, res: Response) => {
  try {
    let query = `SELECT COUNT(*) as total FROM products`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const fetchProducts = (req: Request, res: Response) => {
  try {
    let all = req.query.all === "" ? true : false;
    let sale = req.query.sale === "" ? true : false;
    let withoutSale = req.query.without_sale === "" ? true : false;
    let ltf = req.query.ltf === "" ? true : false; // ltf => less than fifty
    let gtfAndLth = req.query.gtf_lth === "" ? true : false;

    let query: string;

    if (all) {
      query = `SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
              FROM products as p INNER JOIN categories AS c ON p.category_id=c.id`;
    } else if (sale) {
      query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.on_sale=1
      `;
    } else if (withoutSale) {
      query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.on_sale!=1
      `;
    } else if (ltf) {
      query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.price<50
      `;
    } else if (gtfAndLth) {
      query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.price>=50 AND p.price < 100
      `;
    } else {
      query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.price>=100
      `;
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

export const fetchProduct = (req: Request, res: Response) => {
  try {
    res.json(req.product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
