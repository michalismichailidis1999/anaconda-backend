import { Request, Response } from "express";
import db from "../config/db";
import { MysqlError } from "mysql";
import { v4 } from "uuid";
import { validationResult } from "express-validator";
import { errorHandler } from "../helpers/errorMessageHandler";
import {upload} from '../libs/multer';

export const create = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.status(400).json({error: errorHandler(errors.array()[0])});
    }

    const {name, category_id, price, description, quantity, code, weight, image, image2, image3, image4} = req.body;

    let productImage2 = image2 || "";
    let productImage3 = image3 || "";
    let productImage4 = image4 || "";
    let productCode = code || "";

    let productId = v4();

     let query = `SELECT * FROM products WHERE name='${name}'`;

     db.query(query, (err:MysqlError, result) => {
       if(err) throw err;

       if(result.length > 0){
         return res.status(400).json({error: `Product ${name} already exists`});
       }

      query = `
        INSERT INTO products(id, name, category_id, price, description, quantity, code, weight, image, image2, image3, image4)
        VALUES('${productId}', '${name}', '${category_id}', ${price}, '${description}', ${quantity},
        '${productCode}', ${weight}, '${image}', '${productImage2}', '${productImage3}', '${productImage4}')
      `;

      db.query(query, (err: MysqlError) => {
        if(err) throw err;

        res.json({message: `Product ${name} created successfully`});
      });
     })
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const update = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.status(400).json({error: errorHandler(errors.array()[0])});
    }

    const {name, category_id, price, description, quantity, code, weight, image, image2, image3, image4, on_sale, new_price} = req.body;

    let productCode = code || "";

    let query = `SELECT * FROM products WHERE name='${name}'`;

    db.query(query, (err:MysqlError, result) => {
      if(err) throw err;

      if(result.length > 0 && result[0].id !== req.product.id){
        return res.status(400).json({error: `Product ${name} already exists`})
      }

      query = `SELECT image, image2, image3, image4 FROM products WHERE id='${req.product.id}'`;

      db.query(query, (err:MysqlError, result) => {
        if(err) throw err;

        let productImage = result[0].image;
        let productImage2 = result[0].image2;
        let productImage3 = result[0].image3;
        let productImage4 = result[0].image4;

        if(image){
          productImage = image;
        }

        if(image2){
          productImage2 = image2;
        }

        if(image3){
          productImage3 = image3;
        }

        if(image4){
          productImage4 = image4;
        }

        query = `
          UPDATE products SET 
          name='${name}',
          category_id='${category_id}',
          price=${price},
          description='${description}',
          quantity=${quantity},
          code='${code}',
          weight=${weight},
          image='${productImage}',
          image2='${productImage2}',
          image3='${productImage3}',
          image4='${productImage4}',
          on_sale=${on_sale},
          new_price=${new_price}
          WHERE id='${req.product.id}'
        `;

        db.query(query, (err:MysqlError) => {
          if(err) throw err;

          res.json({message: `Product with id of ${req.product.id} updated successfully`});
        })
      })
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const uploadImage = (req: Request, res: Response) => {
  try {
    upload(req, res, (err:any) => {
      if(err) throw err;

      if(!req.file.originalname){
        return res.status(400).json({error: "Something went wrong!"});
      }

      let image_path = "https://anakontaskydra.fra1.digitaloceanspaces.com/uploaded_from_computer/" + req.file.originalname;

      let query = `INSERT INTO product_images(image_path) VALUES('${image_path}')`;

      db.query(query, (err:MysqlError) => {
        if(err) throw err;

        res.json({message: "Image uploaded successfully"});
      })
      
    })
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

export const getProductImages = (req: Request, res:Response) => {
  try {
    let query = 'SELECT * FROM product_images';

    db.query(query, (err:MysqlError, result) => {
      if(err) throw err;

      res.json(result);
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
}