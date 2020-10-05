"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getTotalUsersNumber = exports.deleteAdmin = exports.createAdmin = exports.getAdminAreaCurrentStatus = exports.lockAdminArea = exports.unlockAdminArea = exports.getAdmins = exports.updateAdminExtraPassword = exports.adminExtraSecurity = exports.adminLogin = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = require("jsonwebtoken");
const bcryptjs_1 = require("bcryptjs");
const dotenv_1 = require("dotenv");
const errorMessageHandler_1 = require("../helpers/errorMessageHandler");
const uuid_1 = require("uuid");
dotenv_1.config();
exports.adminLogin = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { email, password } = req.body;
        let query = `SELECT * from users WHERE email='${email}'`;
        db_1.default.query(query, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            let user = result[0];
            let isMatch = yield bcryptjs_1.compare(password, user.password);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ error: "False credentials. User not authorized" });
            }
            if (user.role === 0) {
                return res.json(false);
            }
            query = `SELECT * FROM extra_admin_security_lock_admin WHERE id=1`;
            db_1.default.query(query, (err, result) => {
                if (err)
                    throw err;
                if (result[0].is_locked === 1) {
                    return res.json(false);
                }
                let secret = process.env.JSON_SECRET || "secret";
                jsonwebtoken_1.sign(user.id + "", secret, (err, token) => {
                    if (err)
                        throw err;
                    res.status(200).json({
                        user: {
                            id: user.id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email,
                        },
                        token,
                    });
                });
            });
        }));
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
};
exports.adminExtraSecurity = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { email, password } = req.body;
        let query = `SELECT * from users WHERE email='${email}'`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            if (result.length === 0) {
                return res.status(400).json({ error: "Something went wrong" });
            }
            let user = result[0];
            query = `SELECT * FROM extra_admin_security_password WHERE user_id='${user.id}'`;
            db_1.default.query(query, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
                if (err)
                    throw err;
                if (result.length === 0) {
                    return res.status(400).json({ error: "Something went wrong" });
                }
                let extraSecurity = result[0];
                let isMatch = yield bcryptjs_1.compare(password, extraSecurity.password);
                if (!isMatch) {
                    query = `SELECT * FROM extra_admin_security_lock_admin WHERE id=1`;
                    db_1.default.query(query, (err, result) => {
                        if (err)
                            throw err;
                        let newResult = {
                            is_locked: result[0].is_locked,
                            remaining_tries: parseInt(result[0].remaining_tries) - 1,
                        };
                        if (newResult.remaining_tries === 0) {
                            newResult.is_locked = 1;
                        }
                        query = `UPDATE extra_admin_security_lock_admin 
                    SET is_locked=${newResult.is_locked}, remaining_tries=${newResult.remaining_tries}`;
                        db_1.default.query(query, (err) => {
                            if (err)
                                throw err;
                            res.status(200).json(false);
                        });
                    });
                }
                else {
                    res.status(200).json(true);
                }
            }));
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateAdminExtraPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { password } = req.body;
        let salt = yield bcryptjs_1.genSalt(10);
        let encryptedPassword = yield bcryptjs_1.hash(password, salt);
        let query = `UPDATE extra_admin_security_password SET password='${encryptedPassword}'
    WHERE user_id='${req.user.id}'`;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            res.status(201).json({ message: "Password updated successfully" });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
exports.getAdmins = (req, res) => {
    try {
        let userId = process.env.ADMIN_USER_ID || "";
        let query = `SELECT * FROM users WHERE role='1' AND id!='${userId}'`;
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
exports.unlockAdminArea = (req, res) => {
    let query = `UPDATE extra_admin_security_lock_admin SET is_locked=0,remaining_tries=3 WHERE id=1`;
    db_1.default.query(query, (err) => {
        if (err)
            throw err;
        res.json({ message: "Admin area have been unlocked" });
    });
};
exports.lockAdminArea = (req, res) => {
    let query = `UPDATE extra_admin_security_lock_admin SET is_locked=1,remaining_tries=0 WHERE id=1`;
    db_1.default.query(query, (err) => {
        if (err)
            throw err;
        res.json({ message: "Admin area have been locked" });
    });
};
exports.getAdminAreaCurrentStatus = (req, res) => {
    try {
        let query = `SELECT * FROM extra_admin_security_lock_admin WHERE id=1`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            if (result.length === 0) {
                return res.status(404).json({ error: "Something went wrong" });
            }
            if (result[0].is_locked === 1) {
                return res.json(true);
            }
            else {
                return res.json(false);
            }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.createAdmin = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { firstName, lastName, email, password, extraPassword } = req.body;
        let query = `SELECT * FROM users WHERE email='${email}'`;
        db_1.default.query(query, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            if (result.length > 0) {
                return res
                    .status(400)
                    .json({ error: "This email address is already taken" });
            }
            let salt = yield bcryptjs_1.genSalt(10);
            let encryptedPassword = yield bcryptjs_1.hash(password, salt);
            let userId = uuid_1.v4();
            query = `INSERT INTO users(id, first_name, last_name, email, password, role)
      VALUES('${userId}', '${firstName}', '${lastName}', '${email}', '${encryptedPassword}', 1)`;
            db_1.default.query(query, (err) => __awaiter(void 0, void 0, void 0, function* () {
                if (err)
                    throw err;
                encryptedPassword = yield bcryptjs_1.hash(extraPassword, salt);
                query = `SELECT * FROM users WHERE email='${email}'`;
                db_1.default.query(query, (err, result) => {
                    if (err)
                        throw err;
                    let userId = result[0].id;
                    query = `INSERT INTO extra_admin_security_password(user_id, password) VALUES('${userId}', '${encryptedPassword}')`;
                    db_1.default.query(query, (err) => {
                        if (err)
                            throw err;
                        res.status(201).json({ message: "Admin created" });
                    });
                });
            }));
        }));
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteAdmin = (req, res) => {
    try {
        let query = `SELECT * FROM users WHERE id='${req.params.adminId}' AND role=1`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            if (result.length === 0) {
                return res.status(404).json({ error: "Admin Not Found" });
            }
            query = `DELETE FROM users WHERE id='${req.params.adminId}' and role=1`;
            db_1.default.query(query, (err) => {
                if (err)
                    throw err;
                res.status(200).json({ message: "Admin deleted" });
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getTotalUsersNumber = (req, res) => {
    try {
        let query = `SELECT COUNT(*) as total FROM users WHERE role!=1`;
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
exports.getUsers = (req, res) => {
    try {
        let query = `SELECT u.first_name, u.last_name, u.email, COUNT(o.id) as total_orders, SUM(o.total_price + o.extra_price) as total_money_spend
    FROM users as u INNER JOIN orders as o ON u.email=o.customer GROUP BY u.email`;
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
