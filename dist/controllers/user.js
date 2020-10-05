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
exports.checkIfEmailExists = exports.changePassword = exports.changeEmail = exports.changeUserFirstAndLastNames = exports.getUserDetails = exports.updateDetails = exports.signin = exports.signup = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = require("jsonwebtoken");
const bcryptjs_1 = require("bcryptjs");
const uuid_1 = require("uuid");
const dotenv_1 = require("dotenv");
const errorMessageHandler_1 = require("../helpers/errorMessageHandler");
dotenv_1.config();
const Verifier = require("email-verifier");
const emailVerifierApiKey = process.env.EMAIL_VERIFIER_API_KEY || "";
const verifier = new Verifier(emailVerifierApiKey, {
    checkCatchAll: false,
    checkDisposable: true,
    checkFree: false,
    validateDNS: true,
    validateSMTP: true,
    retries: 2,
});
exports.signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { firstName, lastName, email, password } = req.body;
        let userId = uuid_1.v4();
        let salt = yield bcryptjs_1.genSalt(10);
        let encryptedPassword = yield bcryptjs_1.hash(password, salt);
        let query = `SELECT * FROM users WHERE email='${email}'`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            if (result.length > 0) {
                return res
                    .status(400)
                    .json({ error: "Email address is already taken" });
            }
            query = `INSERT INTO users(id, first_name, last_name, email, password) VALUES('${userId}','${firstName}', '${lastName}', '${email}', '${encryptedPassword}')`;
            let secret = process.env.JSON_SECRET || "secret";
            db_1.default.query(query, (err) => {
                if (err)
                    throw err;
                jsonwebtoken_1.sign(userId, secret, (err, token) => {
                    if (err)
                        throw err;
                    query = `
            INSERT INTO user_details(user_id, county, city, address, phone, zipcode)
            VALUES('${userId}', '', '', '', '', '')
          `;
                    db_1.default.query(query, (err) => {
                        if (err)
                            throw err;
                        res.status(201).json({
                            user: {
                                id: userId,
                                first_name: firstName,
                                last_name: lastName,
                                email,
                            },
                            token,
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
});
exports.signin = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { email, password } = req.body;
        let query = `SELECT * FROM users WHERE email='${email}'`;
        db_1.default.query(query, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            if (result.length === 0) {
                return res
                    .status(404)
                    .json({ message: "Email address or password is incorrect" });
            }
            let user = result[0];
            let isMatch = yield bcryptjs_1.compare(password, user.password);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: "User not authorized. False credentials" });
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
        }));
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateDetails = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { county, city, address, phone, zipcode } = req.body;
        let userId = req.user.id;
        let query = `UPDATE user_details SET county='${county}', city='${city}',
                address='${address}', phone='${phone}', zipcode='${zipcode}'
                WHERE user_id='${req.user.id}' AND id=${req.params.detailsId}`;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            query = `SELECT id, county, city, address, phone, zipcode
       FROM user_details WHERE user_id='${userId}' AND id=${req.params.detailsId}`;
            db_1.default.query(query, (err, result) => {
                if (err)
                    throw err;
                res.status(201).json(result[0]);
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getUserDetails = (req, res) => {
    try {
        let query = `
      SELECT id, county, city, address, phone, zipcode 
      FROM user_details WHERE user_id='${req.user.id}'
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
exports.changeUserFirstAndLastNames = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { firstName, lastName } = req.body;
        let query = `UPDATE users SET first_name='${firstName}', last_name='${lastName}'
                  WHERE id='${req.user.id}'`;
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            res.json({
                message: "User first name and last name updated successfully",
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.changeEmail = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { email } = req.body;
        let query = `SELECT * FROM users WHERE email='${email}'`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            if (result.length > 0) {
                return res.status(400).json({ error: "Email already taken" });
            }
            query = `UPDATE users SET email='${email}' WHERE id='${req.user.id}'`;
            db_1.default.query(query, (err) => {
                if (err)
                    throw err;
                res.json({ message: "Email updated successfully" });
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.changePassword = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { password, newPassword } = req.body;
        let query = `SELECT * FROM users WHERE id='${req.user.id}'`;
        db_1.default.query(query, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            let isMatch = yield bcryptjs_1.compare(password, result[0].password);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ error: "False Credentials. User not Authorized" });
            }
            let salt = yield bcryptjs_1.genSalt(10);
            let encryptedPassword = yield bcryptjs_1.hash(newPassword, salt);
            query = `UPDATE users SET password='${encryptedPassword}' WHERE id='${req.user.id}'`;
            db_1.default.query(query, (err) => {
                if (err)
                    throw err;
                res.json({ message: "Password updated successfully" });
            });
        }));
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.checkIfEmailExists = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { email } = req.body;
        verifier.verify(email, (err, data) => {
            if (err)
                throw err;
            let emailIsValid = data.disposableCheck &&
                data.disposableCheck === "false" &&
                data.smtpCheck &&
                data.smtpCheck !== "false" &&
                data.dnsCheck &&
                data.dnsCheck !== "false"
                ? true
                : false;
            res.json(emailIsValid);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
