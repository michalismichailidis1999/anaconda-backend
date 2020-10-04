"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAuthenticated = exports.requireSignIn = exports.userById = void 0;
var db_1 = __importDefault(require("../config/db"));
var jsonwebtoken_1 = require("jsonwebtoken");
exports.userById = function (req, res, next, id) {
    try {
        var query = "SELECT * FROM users WHERE id='" + id + "'";
        db_1.default.query(query, function (err, result) {
            if (err)
                throw err;
            if (result.length === 0) {
                return res.status(404).json({ error: "User does not exist" });
            }
            req.user = result[0];
            req.user.password = undefined;
            req.user.created_at = undefined;
            next();
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.requireSignIn = function (req, res, next) {
    var _a;
    try {
        var auth = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!auth) {
            return res.status(401).json({ error: "User not authorized" });
        }
        var secret = process.env.JSON_SECRET || "secret";
        jsonwebtoken_1.verify(auth, secret, function (err, decoded) {
            if (err)
                throw err;
            if (typeof decoded === "string") {
                req.auth = decoded;
            }
            next();
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.isAuthenticated = function (req, res, next) {
    try {
        if (req.user.id !== req.auth) {
            return res
                .status(401)
                .json({ error: "User not authorized. False credentials" });
        }
        next();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.isAdmin = function (req, res, next) {
    try {
        if (req.user.role !== 1) {
            return res
                .status(401)
                .json({ message: "User not authorized. Admin area" });
        }
        next();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
