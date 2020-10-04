"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.getOrderById = exports.fetchOrderDetails = exports.fetchOrderCustomerDetails = exports.fetchOrderProducts = exports.fetchOrders = exports.getCategoriesTotalSales = exports.getMonthlyProfits = exports.getAverageMonthlyProfit = exports.getTotalProfit = exports.getTotalOrderNumber = void 0;
var db_1 = __importDefault(require("../config/db"));
var express_validator_1 = require("express-validator");
var errorMessageHandler_1 = require("../helpers/errorMessageHandler");
exports.getTotalOrderNumber = function (req, res) {
    try {
        var query = "SELECT COUNT(*) as total FROM orders";
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
exports.getTotalProfit = function (req, res) {
    try {
        var query = "SELECT SUM(total_price + extra_price) as total_profit FROM orders";
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
exports.getAverageMonthlyProfit = function (req, res) {
    try {
        var query = "\n    SELECT ROUND(AVG(profits.profit)) as avg_monthly_profit FROM (\n      SELECT YEAR(created_at) as year, MONTH(created_at) as month,\n      SUM(total_price + extra_price) as profit FROM orders \n      GROUP BY YEAR(created_at), MONTH(created_at)\n      ORDER BY YEAR(created_at), MONTH(created_at)\n    ) as profits;\n    ";
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
exports.getMonthlyProfits = function (req, res) {
    try {
        var query = "\n    SELECT YEAR(created_at) as year, MONTH(created_at) as month,\n    SUM(total_price + extra_price) as profit FROM orders \n    GROUP BY YEAR(created_at), MONTH(created_at)\n    ORDER BY YEAR(created_at), MONTH(created_at)\n    LIMIT 0,12\n    ";
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
exports.getCategoriesTotalSales = function (req, res) {
    try {
        var query = "\n    SELECT c.name as category, COUNT(*) as total_product_sales FROM order_products as op\n    INNER JOIN categories as c ON c.id=op.category_id GROUP BY c.name\n    ";
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
exports.fetchOrders = function (req, res) {
    try {
        var query = void 0;
        var all = req.query.all === "" ? true : false;
        var newOrders = req.query.new === "" ? true : false;
        var paid = req.query.paid === "" ? true : false;
        var unpaid = req.query.unpaid === "" ? true : false;
        var checked = req.query.checked === "" ? true : false;
        if (all) {
            query = "SELECT id, checked FROM orders";
        }
        else if (newOrders) {
            query = "\n      SELECT id, checked FROM orders \n      WHERE YEAR(created_at)=YEAR(NOW()) AND MONTH(created_at)=MONTH(NOW()) AND DAY(created_at)=DAY(NOW())\n      ";
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
exports.fetchOrderProducts = function (req, res) {
    try {
        var query = "\n    SELECT op.image,op.name,op.price,op.quantity,op.weight,op.code,c.name AS category\n    FROM order_products AS op INNER JOIN categories as c ON c.id=op.category_id WHERE op.order_id='" + req.order.id + "';\n    ";
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
exports.fetchOrderCustomerDetails = function (req, res) {
    try {
        var query = "\n    SELECT odd.county, odd.city, odd.address, odd.phone, odd.zipcode, odd.customer_name, o.customer as customer_email\n    FROM order_delivery_details AS odd INNER JOIN orders AS o ON o.id=odd.order_id WHERE odd.order_id='" + req.order.id + "'\n    ";
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
exports.fetchOrderDetails = function (req, res) {
    try {
        var query = "\n    SELECT o.checked,o.status, o.created_at, o.total_price, o.extra_price, SUM(op.weight * op.quantity) as total_weight, o.payment_method, o.paid, o.created_at\n    FROM orders AS o INNER JOIN order_products AS op ON o.id=op.order_id WHERE o.id='" + req.order.id + "'\n    ";
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
exports.getOrderById = function (req, res) {
    try {
        res.json([{ id: req.order.id, checked: req.order.checked }]);
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
        var _a = req.body, status_1 = _a.status, checked = _a.checked;
        var query = "\n      UPDATE orders SET status='" + status_1 + "', checked=" + checked + " WHERE id='" + req.order.id + "'\n    ";
        db_1.default.query(query, function (err) {
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
