"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesPerCategory = exports.getTotalCategoriesNumber = exports.update = exports.remove = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const errorMessageHandler_1 = require("../helpers/errorMessageHandler");
exports.create = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { name } = req.body;
        let categoryId = uuid_1.v4();
        let query = `SELECT * FROM categories WHERE name='${name}'`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            if (result.length > 0) {
                return res.status(400).json({ message: "Category already exists" });
            }
            query = `INSERT INTO categories(id, name) VALUES('${categoryId}', '${name}')`;
            db_1.default.query(query, (err) => {
                if (err)
                    throw err;
                query = `SELECT * FROM categories WHERE id='${categoryId}'`;
                db_1.default.query(query, (err, result) => {
                    if (err)
                        throw err;
                    res.status(201).json({
                        message: `Category ${name} has been created`,
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
exports.remove = (req, res) => {
    try {
        let query = `DELETE FROM categories WHERE id='${req.category.id}'`;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            res.status(200).json({
                message: `Category ${req.category.name} has been deleted successfully`,
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.update = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { name } = req.body;
        let query = `SELECT * FROM categories WHERE name='${name}'`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            if (result.length > 0) {
                return res.status(400).json({ message: "Category already exists" });
            }
            query = `UPDATE categories SET name='${name}' WHERE id='${req.category.id}'`;
            db_1.default.query(query, (err) => {
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
exports.getTotalCategoriesNumber = (req, res) => {
    try {
        let query = `SELECT COUNT(*) as total FROM categories`;
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
exports.getSalesPerCategory = (req, res) => {
    try {
        let query = `
      SELECT c.name as category, COUNT(*) as total_product_sales FROM order_products as op
      INNER JOIN categories as c ON c.id=op.category_id GROUP BY c.name;
    `;
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
