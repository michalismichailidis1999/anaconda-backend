"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategory = exports.getCategories = void 0;
var db_1 = __importDefault(require("../config/db"));
exports.getCategories = function (req, res) {
    try {
        var query = "SELECT id, name FROM categories";
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
exports.getCategory = function (req, res) {
    try {
        res.status(200).json(req.category);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
