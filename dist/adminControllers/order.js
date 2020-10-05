"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.getOrderById = exports.fetchOrderDetails = exports.fetchOrderCustomerDetails = exports.fetchOrderProducts = exports.fetchOrders = exports.getCategoriesTotalSales = exports.getMonthlyProfits = exports.getAverageMonthlyProfit = exports.getTotalProfit = exports.getTotalOrderNumber = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
const errorMessageHandler_1 = require("../helpers/errorMessageHandler");
exports.getTotalOrderNumber = (req, res) => {
    try {
        let query = `SELECT COUNT(*) as total FROM orders`;
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
exports.getTotalProfit = (req, res) => {
    try {
        let query = `SELECT SUM(total_price + extra_price) as total_profit FROM orders`;
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
exports.getAverageMonthlyProfit = (req, res) => {
    try {
        let query = `
    SELECT ROUND(AVG(profits.profit)) as avg_monthly_profit FROM (
      SELECT YEAR(created_at) as year, MONTH(created_at) as month,
      SUM(total_price + extra_price) as profit FROM orders 
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at)
    ) as profits;
    `;
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
exports.getMonthlyProfits = (req, res) => {
    try {
        let query = `
    SELECT YEAR(created_at) as year, MONTH(created_at) as month,
    SUM(total_price + extra_price) as profit FROM orders 
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY YEAR(created_at), MONTH(created_at)
    LIMIT 0,12
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
exports.getCategoriesTotalSales = (req, res) => {
    try {
        let query = `
    SELECT c.name as category, COUNT(*) as total_product_sales FROM order_products as op
    INNER JOIN categories as c ON c.id=op.category_id GROUP BY c.name
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
exports.fetchOrders = (req, res) => {
    try {
        let query;
        let all = req.query.all === "" ? true : false;
        let newOrders = req.query.new === "" ? true : false;
        let paid = req.query.paid === "" ? true : false;
        let unpaid = req.query.unpaid === "" ? true : false;
        let checked = req.query.checked === "" ? true : false;
        if (all) {
            query = "SELECT id, checked FROM orders";
        }
        else if (newOrders) {
            query = `
      SELECT id, checked FROM orders 
      WHERE YEAR(created_at)=YEAR(NOW()) AND MONTH(created_at)=MONTH(NOW()) AND DAY(created_at)=DAY(NOW())
      `;
        }
        else if (paid) {
            query = "SELECT id, checked FROM orders WHERE paid IS TRUE";
        }
        else if (unpaid) {
            query = "SELECT id, checked FROM orders WHERE paid IS FALSE";
        }
        else if (checked) {
            query = "SELECT id, checked FROM orders WHERE checked IS TRUE";
        }
        else {
            query = "SELECT id, checked FROM orders WHERE checked IS FALSE";
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
exports.fetchOrderProducts = (req, res) => {
    try {
        let query = `
    SELECT op.image,op.name,op.price,op.quantity,op.weight,op.code,c.name AS category
    FROM order_products AS op INNER JOIN categories as c ON c.id=op.category_id WHERE op.order_id='${req.order.id}';
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
exports.fetchOrderCustomerDetails = (req, res) => {
    try {
        let query = `
    SELECT odd.county, odd.city, odd.address, odd.phone, odd.zipcode, odd.customer_name, o.customer as customer_email
    FROM order_delivery_details AS odd INNER JOIN orders AS o ON o.id=odd.order_id WHERE odd.order_id='${req.order.id}'
    `;
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
exports.fetchOrderDetails = (req, res) => {
    try {
        let query = `
    SELECT o.checked,o.status, o.created_at, o.total_price, o.extra_price, SUM(op.weight * op.quantity) as total_weight, o.payment_method, o.paid, o.created_at
    FROM orders AS o INNER JOIN order_products AS op ON o.id=op.order_id WHERE o.id='${req.order.id}'
    `;
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
exports.getOrderById = (req, res) => {
    try {
        res.json([{ id: req.order.id, checked: req.order.checked }]);
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
        const { status, checked } = req.body;
        let query = `
      UPDATE orders SET status='${status}', checked=${checked} WHERE id='${req.order.id}'
    `;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            res.json({ message: "Order updated successfully" });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
