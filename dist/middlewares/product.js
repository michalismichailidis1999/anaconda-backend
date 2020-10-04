"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentById = exports.productById = exports.checkForAllFields = void 0;
var formidable_1 = require("formidable");
var local_storage_1 = require("local-storage");
var db_1 = __importDefault(require("../config/db"));
exports.checkForAllFields = function (req, res, next) {
    try {
        var form = new formidable_1.IncomingForm();
        form.keepExtensions = true;
        var updateProduct_1 = req.query.update === "true" ? true : false;
        form.parse(req, function (err, fields, files) {
            if (err) {
                return res.status(400).json({ error: "Image could not be uploaded" });
            }
            if (!fields.category_id ||
                !fields.name ||
                !fields.price ||
                !fields.quantity ||
                !fields.description ||
                !fields.weight ||
                !fields.code) {
                return res.status(400).json({ error: "Please fill in all fields" });
            }
            if (!files.image && !updateProduct_1) {
                return res.status(400).json({ error: "Please fill in all fields" });
            }
            var product = {
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
            if (!updateProduct_1) {
                product.image = files.image.name;
            }
            else {
                product.image = files.image ? files.image.name : "";
                product.on_sale = parseInt(fields.on_sale + "");
                product.new_price = parseInt(fields.new_price + "");
            }
            product.image2 = files.image2 ? files.image2.name : "";
            product.image3 = files.image3 ? files.image3.name : "";
            product.image4 = files.image4 ? files.image4.name : "";
            local_storage_1.set("product", JSON.stringify(product));
            next();
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.productById = function (req, res, next, id) {
    try {
        var query = "SELECT * FROM products WHERE id='" + id + "'";
        db_1.default.query(query, function (err, result) {
            if (err)
                throw err;
            if (result.length === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            req.product = result[0];
            next();
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.commentById = function (req, res, next, id) {
    try {
        var query = "SELECT * FROM product_comments WHERE id=" + req.params.commentId;
        db_1.default.query(query, function (err, result) {
            if (err)
                throw err;
            if (result.length === 0) {
                return res.status(404).json({ error: "Comment not found" });
            }
            req.comment = result[0];
            next();
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
