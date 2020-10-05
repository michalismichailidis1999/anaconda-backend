"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProduct = exports.fetchProducts = exports.getTotalProductsNumber = exports.deleteComment = exports.remove = exports.update = exports.uploadImage = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const uuid_1 = require("uuid");
const local_storage_1 = require("local-storage");
const multer_1 = __importStar(require("multer"));
const path_1 = require("path");
let destination = path_1.join(__dirname, "../../../", "client", "src", "images", "products");
// Initialize storage
const storage = multer_1.diskStorage({
    destination: destination,
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    },
});
// Initialize Upload
const upload = multer_1.default({
    storage,
}).single("image");
exports.create = (req, res) => {
    try {
        if (local_storage_1.get("product")) {
            const { category_id, name, price, image, image2, image3, image4, quantity, description, code, weight, } = JSON.parse(local_storage_1.get("product"));
            let productId = uuid_1.v4();
            let productName = name;
            let query = `SELECT * FROM products WHERE name='${name}'`;
            db_1.default.query(query, (err, result) => {
                if (err)
                    throw err;
                if (result.length > 0) {
                    return res.status(400).json({ error: "Product already exists" });
                }
                if (code) {
                    query = `INSERT INTO 
        products(id, category_id, name, price, image, image2, image3, image4, quantity, description, code, weight) 
        VALUES('${productId}', '${category_id}', '${name}', ${price}, '${image}', '${image2}', '${image3}', '${image4}', ${quantity}, '${description}', '${code}', ${weight})`;
                }
                else {
                    query = `INSERT INTO 
        products(id, category_id, name, price, image, image2, image3, image4, quantity, description, weight) 
        VALUES('${productId}', '${category_id}', '${name}', ${price}, '${image}', '${image2}', '${image3}', '${image4}', ${quantity}, '${description}', ${weight})`;
                }
                db_1.default.query(query, (err) => {
                    if (err)
                        throw err;
                    local_storage_1.remove("product");
                    res.status(201).json({
                        message: `Product ${productName} has been created successfully`,
                    });
                });
            });
        }
        else {
            return res.json({
                error: "Something went wrong. Product could not be created",
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.uploadImage = (req, res) => {
    try {
        upload(req, res, () => {
            if (req.file) {
                res.status(200).json({ message: "Image uploaded successfully" });
            }
            else {
                res.status(400).json({ error: "Image is required" });
            }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.update = (req, res) => {
    try {
        if (local_storage_1.get("product")) {
            const { category_id, name, price, image, image2, image3, image4, quantity, description, code, weight, on_sale, new_price, } = JSON.parse(local_storage_1.get("product"));
            let productName = name;
            let query = `SELECT image, image2, image3, image4 FROM products WHERE id='${req.product.id}'`;
            db_1.default.query(query, (err, result) => {
                if (err)
                    throw err;
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
                db_1.default.query(query, (err) => {
                    if (err)
                        throw err;
                    local_storage_1.remove("product");
                    res.status(201).json({
                        message: `Product ${productName} has been updated successfully`,
                    });
                });
            });
        }
        else {
            return res.json({
                error: "Something went wrong. Product could not be updated",
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.remove = (req, res) => {
    try {
        let query = `DELETE FROM products WHERE id='${req.product.id}'`;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            res.status(200).json({ message: "Product deleted successfully" });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteComment = (req, res) => {
    try {
        let query = `DELETE FROM product_comments WHERE id=${req.comment.id}`;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            res
                .status(200)
                .json({ message: "Comment has been deleted successfully" });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getTotalProductsNumber = (req, res) => {
    try {
        let query = `SELECT COUNT(*) as total FROM products`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            res.json(result[0]);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.fetchProducts = (req, res) => {
    try {
        let all = req.query.all === "" ? true : false;
        let sale = req.query.sale === "" ? true : false;
        let withoutSale = req.query.without_sale === "" ? true : false;
        let ltf = req.query.ltf === "" ? true : false; // ltf => less than fifty
        let gtfAndLth = req.query.gtf_lth === "" ? true : false;
        let query;
        if (all) {
            query = `SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
              FROM products as p INNER JOIN categories AS c ON p.category_id=c.id`;
        }
        else if (sale) {
            query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.on_sale=1
      `;
        }
        else if (withoutSale) {
            query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.on_sale!=1
      `;
        }
        else if (ltf) {
            query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.price<50
      `;
        }
        else if (gtfAndLth) {
            query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.price>=50 AND p.price < 100
      `;
        }
        else {
            query = `
      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category 
      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id
      WHERE p.price>=100
      `;
        }
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            res.json(result);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.fetchProduct = (req, res) => {
    try {
        res.json(req.product);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
