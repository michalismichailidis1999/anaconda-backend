"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("mysql"));
var dotenv_1 = require("dotenv");
dotenv_1.config();
var user = "doadmin";
var host = "anakonta-database-do-user-7508325-0.b.db.ondigitalocean.com";
var port = 25060;
var password = "sqgp6pgs7ud8qujp";
var database = "anaconda";
console.log(user, host, port, password, database);
var db = mysql_1.default.createConnection({
  user: user,
  host: host,
  port: port,
  password: password,
  database: database,
});
exports.default = db;
