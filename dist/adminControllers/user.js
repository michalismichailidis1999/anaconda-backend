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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getTotalUsersNumber = exports.deleteAdmin = exports.createAdmin = exports.getAdminAreaCurrentStatus = exports.lockAdminArea = exports.unlockAdminArea = exports.getAdmins = exports.updateAdminExtraPassword = exports.adminExtraSecurity = exports.adminLogin = void 0;
var db_1 = __importDefault(require("../config/db"));
var express_validator_1 = require("express-validator");
var jsonwebtoken_1 = require("jsonwebtoken");
var bcryptjs_1 = require("bcryptjs");
var dotenv_1 = require("dotenv");
var errorMessageHandler_1 = require("../helpers/errorMessageHandler");
var uuid_1 = require("uuid");
dotenv_1.config();
exports.adminLogin = function (req, res) {
    try {
        var errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        var _a = req.body, email = _a.email, password_1 = _a.password;
        var query_1 = "SELECT * from users WHERE email='" + email + "'";
        db_1.default.query(query_1, function (err, result) { return __awaiter(void 0, void 0, void 0, function () {
            var user, isMatch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (err)
                            throw err;
                        user = result[0];
                        return [4 /*yield*/, bcryptjs_1.compare(password_1, user.password)];
                    case 1:
                        isMatch = _a.sent();
                        if (!isMatch) {
                            return [2 /*return*/, res
                                    .status(401)
                                    .json({ error: "False credentials. User not authorized" })];
                        }
                        if (user.role === 0) {
                            return [2 /*return*/, res.json(false)];
                        }
                        query_1 = "SELECT * FROM extra_admin_security_lock_admin WHERE id=1";
                        db_1.default.query(query_1, function (err, result) {
                            if (err)
                                throw err;
                            if (result[0].is_locked === 1) {
                                return res.json(false);
                            }
                            var secret = process.env.JSON_SECRET || "secret";
                            jsonwebtoken_1.sign(user.id + "", secret, function (err, token) {
                                if (err)
                                    throw err;
                                res.status(200).json({
                                    user: {
                                        id: user.id,
                                        first_name: user.first_name,
                                        last_name: user.last_name,
                                        email: user.email,
                                    },
                                    token: token,
                                });
                            });
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
};
exports.adminExtraSecurity = function (req, res) {
    try {
        var errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        var _a = req.body, email = _a.email, password_2 = _a.password;
        var query_2 = "SELECT * from users WHERE email='" + email + "'";
        db_1.default.query(query_2, function (err, result) {
            if (err)
                throw err;
            if (result.length === 0) {
                return res.status(400).json({ error: "Something went wrong" });
            }
            var user = result[0];
            query_2 = "SELECT * FROM extra_admin_security_password WHERE user_id='" + user.id + "'";
            db_1.default.query(query_2, function (err, result) { return __awaiter(void 0, void 0, void 0, function () {
                var extraSecurity, isMatch;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (err)
                                throw err;
                            if (result.length === 0) {
                                return [2 /*return*/, res.status(400).json({ error: "Something went wrong" })];
                            }
                            extraSecurity = result[0];
                            return [4 /*yield*/, bcryptjs_1.compare(password_2, extraSecurity.password)];
                        case 1:
                            isMatch = _a.sent();
                            if (!isMatch) {
                                query_2 = "SELECT * FROM extra_admin_security_lock_admin WHERE id=1";
                                db_1.default.query(query_2, function (err, result) {
                                    if (err)
                                        throw err;
                                    var newResult = {
                                        is_locked: result[0].is_locked,
                                        remaining_tries: parseInt(result[0].remaining_tries) - 1,
                                    };
                                    if (newResult.remaining_tries === 0) {
                                        newResult.is_locked = 1;
                                    }
                                    query_2 = "UPDATE extra_admin_security_lock_admin \n                    SET is_locked=" + newResult.is_locked + ", remaining_tries=" + newResult.remaining_tries;
                                    db_1.default.query(query_2, function (err) {
                                        if (err)
                                            throw err;
                                        res.status(200).json(false);
                                    });
                                });
                            }
                            else {
                                res.status(200).json(true);
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateAdminExtraPassword = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errors, password, salt, encryptedPassword, query, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                errors = express_validator_1.validationResult(req);
                if (!errors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) })];
                }
                password = req.body.password;
                return [4 /*yield*/, bcryptjs_1.genSalt(10)];
            case 1:
                salt = _a.sent();
                return [4 /*yield*/, bcryptjs_1.hash(password, salt)];
            case 2:
                encryptedPassword = _a.sent();
                query = "UPDATE extra_admin_security_password SET password='" + encryptedPassword + "'\n    WHERE user_id='" + req.user.id + "'";
                db_1.default.query(query, function (err) {
                    if (err)
                        throw err;
                    res.status(201).json({ message: "Password updated successfully" });
                });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log(err_1);
                res.status(500).json({ error: err_1.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getAdmins = function (req, res) {
    try {
        var userId = process.env.ADMIN_USER_ID || "";
        var query = "SELECT * FROM users WHERE role='1' AND id!='" + userId + "'";
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
exports.unlockAdminArea = function (req, res) {
    var query = "UPDATE extra_admin_security_lock_admin SET is_locked=0,remaining_tries=3 WHERE id=1";
    db_1.default.query(query, function (err) {
        if (err)
            throw err;
        res.json({ message: "Admin area have been unlocked" });
    });
};
exports.lockAdminArea = function (req, res) {
    var query = "UPDATE extra_admin_security_lock_admin SET is_locked=1,remaining_tries=0 WHERE id=1";
    db_1.default.query(query, function (err) {
        if (err)
            throw err;
        res.json({ message: "Admin area have been locked" });
    });
};
exports.getAdminAreaCurrentStatus = function (req, res) {
    try {
        var query = "SELECT * FROM extra_admin_security_lock_admin WHERE id=1";
        db_1.default.query(query, function (err, result) {
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
exports.createAdmin = function (req, res) {
    try {
        var errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        var _a = req.body, firstName_1 = _a.firstName, lastName_1 = _a.lastName, email_1 = _a.email, password_3 = _a.password, extraPassword_1 = _a.extraPassword;
        var query_3 = "SELECT * FROM users WHERE email='" + email_1 + "'";
        db_1.default.query(query_3, function (err, result) { return __awaiter(void 0, void 0, void 0, function () {
            var salt, encryptedPassword, userId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (err)
                            throw err;
                        if (result.length > 0) {
                            return [2 /*return*/, res
                                    .status(400)
                                    .json({ error: "This email address is already taken" })];
                        }
                        return [4 /*yield*/, bcryptjs_1.genSalt(10)];
                    case 1:
                        salt = _a.sent();
                        return [4 /*yield*/, bcryptjs_1.hash(password_3, salt)];
                    case 2:
                        encryptedPassword = _a.sent();
                        userId = uuid_1.v4();
                        query_3 = "INSERT INTO users(id, first_name, last_name, email, password, role)\n      VALUES('" + userId + "', '" + firstName_1 + "', '" + lastName_1 + "', '" + email_1 + "', '" + encryptedPassword + "', 1)";
                        db_1.default.query(query_3, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (err)
                                            throw err;
                                        return [4 /*yield*/, bcryptjs_1.hash(extraPassword_1, salt)];
                                    case 1:
                                        encryptedPassword = _a.sent();
                                        query_3 = "SELECT * FROM users WHERE email='" + email_1 + "'";
                                        db_1.default.query(query_3, function (err, result) {
                                            if (err)
                                                throw err;
                                            var userId = result[0].id;
                                            query_3 = "INSERT INTO extra_admin_security_password(user_id, password) VALUES('" + userId + "', '" + encryptedPassword + "')";
                                            db_1.default.query(query_3, function (err) {
                                                if (err)
                                                    throw err;
                                                res.status(201).json({ message: "Admin created" });
                                            });
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        }); });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteAdmin = function (req, res) {
    try {
        var query_4 = "SELECT * FROM users WHERE id='" + req.params.adminId + "' AND role=1";
        db_1.default.query(query_4, function (err, result) {
            if (err)
                throw err;
            if (result.length === 0) {
                return res.status(404).json({ error: "Admin Not Found" });
            }
            query_4 = "DELETE FROM users WHERE id='" + req.params.adminId + "' and role=1";
            db_1.default.query(query_4, function (err) {
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
exports.getTotalUsersNumber = function (req, res) {
    try {
        var query = "SELECT COUNT(*) as total FROM users WHERE role!=1";
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
exports.getUsers = function (req, res) {
    try {
        var query = "SELECT u.first_name, u.last_name, u.email, COUNT(o.id) as total_orders, SUM(o.total_price + o.extra_price) as total_money_spend\n    FROM users as u INNER JOIN orders as o ON u.email=o.customer GROUP BY u.email";
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
