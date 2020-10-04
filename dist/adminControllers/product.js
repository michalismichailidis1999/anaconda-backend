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
var db_1 = __importDefault(require("../config/db"));
var uuid_1 = require("uuid");
var local_storage_1 = require("local-storage");
var multer_1 = __importStar(require("multer"));
var path_1 = require("path");
var destination = path_1.join(__dirname, "../../../", "client", "src", "images", "products");
// Initialize storage
var storage = multer_1.diskStorage({
    destination: destination,
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    },
});
// Initialize Upload
var upload = multer_1.default({
    storage: storage,
}).single("image");
exports.create = function (req, res) {
    try {
        if (local_storage_1.get("product")) {
            var _a = JSON.parse(local_storage_1.get("product")), category_id_1 = _a.category_id, name_1 = _a.name, price_1 = _a.price, image_1 = _a.image, image2_1 = _a.image2, image3_1 = _a.image3, image4_1 = _a.image4, quantity_1 = _a.quantity, description_1 = _a.description, code_1 = _a.code, weight_1 = _a.weight;
            var productId_1 = uuid_1.v4();
            var productName_1 = name_1;
            var query_1 = "SELECT * FROM products WHERE name='" + name_1 + "'";
            db_1.default.query(query_1, function (err, result) {
                if (err)
                    throw err;
                if (result.length > 0) {
                    return res.status(400).json({ error: "Product already exists" });
                }
                if (code_1) {
                    query_1 = "INSERT INTO \n        products(id, category_id, name, price, image, image2, image3, image4, quantity, description, code, weight) \n        VALUES('" + productId_1 + "', '" + category_id_1 + "', '" + name_1 + "', " + price_1 + ", '" + image_1 + "', '" + image2_1 + "', '" + image3_1 + "', '" + image4_1 + "', " + quantity_1 + ", '" + description_1 + "', '" + code_1 + "', " + weight_1 + ")";
                }
                else {
                    query_1 = "INSERT INTO \n        products(id, category_id, name, price, image, image2, image3, image4, quantity, description, weight) \n        VALUES('" + productId_1 + "', '" + category_id_1 + "', '" + name_1 + "', " + price_1 + ", '" + image_1 + "', '" + image2_1 + "', '" + image3_1 + "', '" + image4_1 + "', " + quantity_1 + ", '" + description_1 + "', " + weight_1 + ")";
                }
                db_1.default.query(query_1, function (err) {
                    if (err)
                        throw err;
                    local_storage_1.remove("product");
                    res.status(201).json({
                        message: "Product " + productName_1 + " has been created successfully",
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
exports.uploadImage = function (req, res) {
    try {
        upload(req, res, function () {
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
exports.update = function (req, res) {
    try {
        if (local_storage_1.get("product")) {
            var _a = JSON.parse(local_storage_1.get("product")), category_id_2 = _a.category_id, name_2 = _a.name, price_2 = _a.price, image_2 = _a.image, image2_2 = _a.image2, image3_2 = _a.image3, image4_2 = _a.image4, quantity_2 = _a.quantity, description_2 = _a.description, code_2 = _a.code, weight_2 = _a.weight, on_sale_1 = _a.on_sale, new_price_1 = _a.new_price;
            var productName_2 = name_2;
            var query_2 = "SELECT image, image2, image3, image4 FROM products WHERE id='" + req.product.id + "'";
            db_1.default.query(query_2, function (err, result) {
                if (err)
                    throw err;
                var pImage = image_2 || result[0].image;
                var pImage2 = image2_2 || result[0].image2;
                var pImage3 = image3_2 || result[0].image3;
                var pImage4 = image4_2 || result[0].image4;
                query_2 = "UPDATE products SET\n         category_id='" + category_id_2 + "',\n          name='" + name_2 + "',\n          price=" + price_2 + ",\n          image='" + pImage + "',\n          image2='" + pImage2 + "',\n          image3='" + pImage3 + "',\n          image4='" + pImage4 + "',\n          code='" + code_2 + "',\n          weight=" + weight_2 + ",\n          quantity=" + quantity_2 + ",\n          description='" + description_2 + "',\n          on_sale=" + on_sale_1 + ",\n          new_price=" + new_price_1 + ",\n          updated_at=NOW() WHERE id='" + req.product.id + "'";
                db_1.default.query(query_2, function (err) {
                    if (err)
                        throw err;
                    local_storage_1.remove("product");
                    res.status(201).json({
                        message: "Product " + productName_2 + " has been updated successfully",
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
exports.remove = function (req, res) {
    try {
        var query = "DELETE FROM products WHERE id='" + req.product.id + "'";
        db_1.default.query(query, function (err) {
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
exports.deleteComment = function (req, res) {
    try {
        var query = "DELETE FROM product_comments WHERE id=" + req.comment.id;
        db_1.default.query(query, function (err) {
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
exports.getTotalProductsNumber = function (req, res) {
    try {
        var query = "SELECT COUNT(*) as total FROM products";
        db_1.default.query(query, function (err, result) {
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
exports.fetchProducts = function (req, res) {
    try {
        var all = req.query.all === "" ? true : false;
        var sale = req.query.sale === "" ? true : false;
        var withoutSale = req.query.without_sale === "" ? true : false;
        var ltf = req.query.ltf === "" ? true : false; // ltf => less than fifty
        var gtfAndLth = req.query.gtf_lth === "" ? true : false;
        var query = void 0;
        if (all) {
            query = "SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category \n              FROM products as p INNER JOIN categories AS c ON p.category_id=c.id";
        }
        else if (sale) {
            query = "\n      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category \n      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id\n      WHERE p.on_sale=1\n      ";
        }
        else if (withoutSale) {
            query = "\n      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category \n      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id\n      WHERE p.on_sale!=1\n      ";
        }
        else if (ltf) {
            query = "\n      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category \n      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id\n      WHERE p.price<50\n      ";
        }
        else if (gtfAndLth) {
            query = "\n      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category \n      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id\n      WHERE p.price>=50 AND p.price < 100\n      ";
        }
        else {
            query = "\n      SELECT p.id, p.image, p.name, p.price, p.weight, p.rate, p.code, c.name as category \n      FROM products as p INNER JOIN categories AS c ON p.category_id=c.id\n      WHERE p.price>=100\n      ";
        }
        db_1.default.query(query, function (err, result) {
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
exports.fetchProduct = function (req, res) {
    try {
        res.json(req.product);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
