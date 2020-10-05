"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const dotenv_1 = require("dotenv");
dotenv_1.config();
let user = process.env.DB_USER || "";
let host = process.env.DB_HOST || "";
let port = parseInt(process.env.DB_PORT || "0");
let password = process.env.DB_PASSWORD || "";
let database = process.env.DB_NAME || "";
const db = mysql_1.default.createConnection({
    user,
    host,
    port,
    password,
    database,
});
exports.default = db;
