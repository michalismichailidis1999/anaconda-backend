"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderById = void 0;
var db_1 = __importDefault(require("../config/db"));
exports.orderById = function (req, res, next, id) {
    try {
        var query = "SELECT * FROM orders WHERE id='" + id + "'";
        db_1.default.query(query, function (err, result) {
            if (err)
                throw err;
            if (result.length === 0) {
                return res.status(404).json({ error: "Order does not found" });
            }
            req.order = result[0];
            next();
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};