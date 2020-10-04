"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesPerCategory = exports.getTotalCategoriesNumber = exports.update = exports.remove = exports.create = void 0;
var db_1 = __importDefault(require("../config/db"));
var uuid_1 = require("uuid");
var express_validator_1 = require("express-validator");
var errorMessageHandler_1 = require("../helpers/errorMessageHandler");
exports.create = function (req, res) {
    try {
        var errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        var name_1 = req.body.name;
        var categoryId_1 = uuid_1.v4();
        var query_1 = "SELECT * FROM categories WHERE name='" + name_1 + "'";
        db_1.default.query(query_1, function (err, result) {
            if (err)
                throw err;
            if (result.length > 0) {
                return res.status(400).json({ message: "Category already exists" });
            }
            query_1 = "INSERT INTO categories(id, name) VALUES('" + categoryId_1 + "', '" + name_1 + "')";
            db_1.default.query(query_1, function (err) {
                if (err)
                    throw err;
                query_1 = "SELECT * FROM categories WHERE id='" + categoryId_1 + "'";
                db_1.default.query(query_1, function (err, result) {
                    if (err)
                        throw err;
                    res.status(201).json({
                        message: "Category " + name_1 + " has been created",
                        category: result[0],
                    });
                });
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.remove = function (req, res) {
    try {
        var query = "DELETE FROM categories WHERE id='" + req.category.id + "'";
        db_1.default.query(query, function (err) {
            if (err)
                throw err;
            res.status(200).json({
                message: "Category " + req.category.name + " has been deleted successfully",
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.update = function (req, res) {
    try {
        var errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        var name_2 = req.body.name;
        var query_2 = "SELECT * FROM categories WHERE name='" + name_2 + "'";
        db_1.default.query(query_2, function (err, result) {
            if (err)
                throw err;
            if (result.length > 0) {
                return res.status(400).json({ message: "Category already exists" });
            }
            query_2 = "UPDATE categories SET name='" + name_2 + "' WHERE id='" + req.category.id + "'";
            db_1.default.query(query_2, function (err) {
                if (err)
                    throw err;
                res
                    .status(200)
                    .json({ message: "Category has been updated successfully" });
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getTotalCategoriesNumber = function (req, res) {
    try {
        var query = "SELECT COUNT(*) as total FROM categories";
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
exports.getSalesPerCategory = function (req, res) {
    try {
        var query = "\n      SELECT c.name as category, COUNT(*) as total_product_sales FROM order_products as op\n      INNER JOIN categories as c ON c.id=op.category_id GROUP BY c.name;\n    ";
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
