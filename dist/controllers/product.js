"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.searchProduct = exports.deleteComment = exports.createComment = exports.getProductComments = exports.getProductRates = exports.updateProductRating = exports.rateProduct = exports.getProduct = exports.getProducts = void 0;
var db_1 = __importDefault(require("../config/db"));
var express_validator_1 = require("express-validator");
var errorMessageHandler_1 = require("../helpers/errorMessageHandler");
exports.getProducts = function (req, res) {
    try {
        // ?page=1&filter=price&sortBy=desc&category=(category_id)
        var page = parseInt("" + req.query.page) || 1;
        var filter = req.query.filter || "created_at";
        var sortBy = req.query.sortBy || "ASC";
        var category = req.query.category || "all";
        var limit = req.query.limit || 20;
        var sale = filter === "sale" ? true : false;
        var random = req.query.random ? true : false;
        if (page < 0) {
            return res
                .status(400)
                .json({ error: "Page number must not be negative" });
        }
        var query = "SELECT * FROM products WHERE on_sale=0 ORDER BY " + filter + " " + sortBy + " LIMIT " + (page - 1) * 20 + ", " + limit;
        if (category !== "all") {
            query = "SELECT * FROM products WHERE category_id='" + category + "' AND on_sale=0 \n      ORDER BY " + filter + " " + sortBy + " LIMIT " + (page - 1) * 20 + ", " + limit;
        }
        if (sale) {
            if (category !== "all") {
                query = "SELECT * FROM products WHERE category_id='" + category + "' AND on_sale=1 \n        ORDER BY created_at " + sortBy + " LIMIT " + (page - 1) * 20 + ", " + limit;
            }
            else {
                query = "SELECT * FROM products WHERE on_sale=1 \n        ORDER BY created_at " + sortBy + " LIMIT " + (page - 1) * 20 + ", " + limit;
            }
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
exports.getProduct = function (req, res) {
    try {
        var query_1 = "SELECT * FROM products WHERE id='" + req.product.id + "'";
        db_1.default.query(query_1, function (err, product) {
            if (err)
                throw err;
            query_1 = "SELECT  stars AS star, COUNT(*) AS stars_count\n      FROM product_rates WHERE product_id='" + req.product.id + "' GROUP BY stars;";
            db_1.default.query(query_1, function (err, rates) {
                if (err)
                    throw err;
                query_1 = "\n        SELECT pc.id, pc.user_id, pc.comment, CONCAT(us.first_name, \" \", us.last_name) AS user, pr.stars as rate FROM product_comments pc\n        INNER JOIN users us ON pc.user_id=us.id\n        LEFT JOIN product_rates pr ON pc.product_id=pr.product_id AND pc.user_id=pr.user_id\n        WHERE pc.product_id='" + req.product.id + "'\n        ";
                db_1.default.query(query_1, function (err, comments) {
                    if (err)
                        throw err;
                    query_1 = "SELECT name FROM categories WHERE id='" + req.product.category_id + "'";
                    db_1.default.query(query_1, function (err, category) {
                        if (err)
                            throw err;
                        var userId = req.query.userId || "";
                        query_1 = "SELECT stars FROM product_rates \n            WHERE user_id='" + userId + "' AND product_id='" + req.product.id + "'";
                        db_1.default.query(query_1, function (err, result) {
                            if (err)
                                throw err;
                            var rate = 0;
                            if (result.length !== 0) {
                                rate = result[0].stars;
                            }
                            res.status(200).json({
                                product: product[0],
                                rates: rates,
                                comments: comments,
                                category: category[0].name,
                                my_rate: rate
                            });
                        });
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
exports.rateProduct = function (req, res) {
    try {
        var errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        var stars_1 = req.body.stars;
        var query_2 = "INSERT INTO product_rates(stars, user_id, product_id) VALUES(" + stars_1 + ", '" + req.user.id + "', '" + req.product.id + "')";
        db_1.default.query(query_2, function (err) {
            if (err)
                throw err;
            query_2 = "SELECT (FLOOR(SUM(stars) / COUNT(stars))) as rate FROM product_rates INNER JOIN products ON product_rates.product_id=products.id";
            db_1.default.query(query_2, function (err, result) {
                if (err)
                    throw err;
                query_2 = "UPDATE products SET rate=" + result[0].rate + " WHERE id='" + req.product.id + "'";
                db_1.default.query(query_2, function (err) {
                    if (err)
                        throw err;
                    var message = "You have rate product " + req.product.name + " " + stars_1 + " star";
                    if (stars_1 > 1) {
                        message += "s";
                    }
                    res.status(201).json({ message: message });
                });
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateProductRating = function (req, res) {
    try {
        var errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        var stars_2 = req.body.stars;
        var query_3 = "UPDATE product_rates SET stars=" + stars_2;
        db_1.default.query(query_3, function (err) {
            if (err)
                throw err;
            query_3 = "SELECT (FLOOR(SUM(stars) / COUNT(stars))) as rate FROM product_rates INNER JOIN products ON product_rates.product_id=products.id";
            db_1.default.query(query_3, function (err, result) {
                if (err)
                    throw err;
                query_3 = "UPDATE products SET rate=" + result[0].rate + " WHERE id='" + req.product.id + "'";
                db_1.default.query(query_3, function (err) {
                    if (err)
                        throw err;
                    var message = "You have rate product " + req.product.name + " " + stars_2 + " star";
                    if (stars_2 > 1) {
                        message += "s";
                    }
                    res.status(201).json({ message: message });
                });
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getProductRates = function (req, res) {
    try {
        var query = "SELECT * FROM product_rates WHERE product_id='" + req.product.id + "'";
        db_1.default.query(query, function (err, result) {
            if (err)
                throw err;
            res.status(200).json(result);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getProductComments = function (req, res) {
    try {
        var query = "\n    SELECT pc.id, pc.comment, pc.user_id, CONCAT(us.first_name, \" \", us.last_name) AS user, pr.stars as rate FROM product_comments pc\n    INNER JOIN users us ON pc.user_id=us.id\n    LEFT JOIN product_rates pr ON pc.product_id=pr.product_id AND pc.user_id=pr.user_id\n    WHERE pc.product_id='" + req.product.id + "'\n    ";
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
exports.createComment = function (req, res) {
    try {
        var errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        var comment = req.body.comment;
        var query = "INSERT INTO product_comments(comment, user_id, product_id) VALUES('" + comment + "', '" + req.user.id + "', '" + req.product.id + "')";
        db_1.default.query(query, function (err) {
            if (err)
                throw err;
            res.status(201).json({
                message: "Your comment on product " + req.product.name + " has been created successfully"
            });
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
                .json({ message: "Your comment has been deleted successfully" });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.searchProduct = function (req, res) {
    try {
        var errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        var search_1 = req.body.search;
        if (search_1 === "empty") {
            res.status(200).json([]);
        }
        var page = parseInt("" + req.query.page) || 1;
        var filter = req.query.filter || "created_at";
        var sortBy = req.query.sortBy || "ASC";
        var category = req.query.category || "all";
        var limit = req.query.limit || 20;
        var sale = filter === "sale" ? true : false;
        if (page < 0) {
            return res
                .status(400)
                .json({ error: "Page number must not be negative" });
        }
        var query = "SELECT * FROM products WHERE on_sale<>1 ORDER BY " + filter + " " + sortBy + " LIMIT " + (page - 1) * 20 + ", " + limit;
        if (category !== "all") {
            query = "SELECT * FROM products WHERE category_id='" + category + " AND on_sale<>1' \n      ORDER BY " + filter + " " + sortBy + " LIMIT " + (page - 1) * 20 + ", " + limit;
        }
        if (sale) {
            if (category !== "all") {
                query = "SELECT * FROM products WHERE category_id='" + category + "' AND on_sale=1 \n        ORDER BY created_at " + sortBy + " LIMIT " + (page - 1) * 20 + ", " + limit;
            }
            else {
                query = "SELECT * FROM products WHERE on_sale=1 \n        ORDER BY created_at " + sortBy + " LIMIT " + (page - 1) * 20 + ", " + limit;
            }
        }
        db_1.default.query(query, function (err, result) {
            if (err)
                throw err;
            var regex = new RegExp(search_1.toLowerCase(), "i");
            var searchedResults = [];
            for (var i = 0; i < result.length; i++) {
                if (regex.test(result[i].name)) {
                    searchedResults.push(result[i]);
                }
            }
            res.status(200).json(searchedResults);
        });
    }
    catch (err) {
        console.log(err);
        res.json({ error: err.message });
    }
};
exports.getRecommendations = function (req, res) {
    try {
        var category = req.query.category;
        if (!category) {
            return res
                .status(400)
                .json({ error: "Something went wrong with the request" });
        }
        var query = "SELECT * FROM products WHERE category_id='" + category + "' ORDER BY RAND() LIMIT 4";
        db_1.default.query(query, function (err, result) {
            if (err)
                throw err;
            res.status(200).json(result);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
