"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfEmailExists = exports.changePassword = exports.changeEmail = exports.changeUserFirstAndLastNames = exports.getUserDetails = exports.updateDetails = exports.signin = exports.signup = void 0;
var db_1 = __importDefault(require("../config/db"));
var express_validator_1 = require("express-validator");
var jsonwebtoken_1 = require("jsonwebtoken");
var bcryptjs_1 = require("bcryptjs");
var uuid_1 = require("uuid");
var dotenv_1 = require("dotenv");
var errorMessageHandler_1 = require("../helpers/errorMessageHandler");
dotenv_1.config();
var Verifier = require("email-verifier");
var verifier = new Verifier("at_Vm66G9lEdZgA555lwowqnPp7VDeCt", {
  checkCatchAll: false,
  checkDisposable: true,
  checkFree: false,
  validateDNS: true,
  validateSMTP: true,
  retries: 2,
});
exports.signup = function (req, res) {
  return __awaiter(void 0, void 0, void 0, function () {
    var errors,
      _a,
      firstName_1,
      lastName_1,
      email_1,
      password,
      userId_1,
      salt,
      encryptedPassword_1,
      query_1,
      err_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          errors = express_validator_1.validationResult(req);
          if (!errors.isEmpty()) {
            return [
              2 /*return*/,
              res.status(400).json({
                error: errorMessageHandler_1.errorHandler(errors.array()[0]),
              }),
            ];
          }
          (_a = req.body),
            (firstName_1 = _a.firstName),
            (lastName_1 = _a.lastName),
            (email_1 = _a.email),
            (password = _a.password);
          userId_1 = uuid_1.v4();
          return [4 /*yield*/, bcryptjs_1.genSalt(10)];
        case 1:
          salt = _b.sent();
          return [4 /*yield*/, bcryptjs_1.hash(password, salt)];
        case 2:
          encryptedPassword_1 = _b.sent();
          query_1 = "SELECT * FROM users WHERE email='" + email_1 + "'";
          db_1.default.query(query_1, function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              return res
                .status(400)
                .json({ error: "Email address is already taken" });
            }
            query_1 =
              "INSERT INTO users(id, first_name, last_name, email, password) VALUES('" +
              userId_1 +
              "','" +
              firstName_1 +
              "', '" +
              lastName_1 +
              "', '" +
              email_1 +
              "', '" +
              encryptedPassword_1 +
              "')";
            var secret = process.env.JSON_SECRET || "secret";
            db_1.default.query(query_1, function (err) {
              if (err) throw err;
              jsonwebtoken_1.sign(userId_1, secret, function (err, token) {
                if (err) throw err;
                query_1 =
                  "\n            INSERT INTO user_details(user_id, county, city, address, phone, zipcode)\n            VALUES('" +
                  userId_1 +
                  "', '', '', '', '', '')\n          ";
                db_1.default.query(query_1, function (err) {
                  if (err) throw err;
                  res.status(201).json({
                    user: {
                      id: userId_1,
                      first_name: firstName_1,
                      last_name: lastName_1,
                      email: email_1,
                    },
                    token: token,
                  });
                });
              });
            });
          });
          return [3 /*break*/, 4];
        case 3:
          err_1 = _b.sent();
          console.log(err_1);
          res.status(500).json({ error: err_1.message });
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
};
exports.signin = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var _a = req.body,
      email = _a.email,
      password_1 = _a.password;
    var query = "SELECT * FROM users WHERE email='" + email + "'";
    db_1.default.query(query, function (err, result) {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, isMatch, secret;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (err) throw err;
              if (result.length === 0) {
                return [
                  2 /*return*/,
                  res.status(404).json({
                    message: "Email address or password is incorrect",
                  }),
                ];
              }
              user = result[0];
              return [
                4 /*yield*/,
                bcryptjs_1.compare(password_1, user.password),
              ];
            case 1:
              isMatch = _a.sent();
              if (!isMatch) {
                return [
                  2 /*return*/,
                  res.status(401).json({
                    message: "User not authorized. False credentials",
                  }),
                ];
              }
              secret = process.env.JSON_SECRET || "secret";
              jsonwebtoken_1.sign(user.id + "", secret, function (err, token) {
                if (err) throw err;
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
              return [2 /*return*/];
          }
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.updateDetails = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var _a = req.body,
      county = _a.county,
      city = _a.city,
      address = _a.address,
      phone = _a.phone,
      zipcode = _a.zipcode;
    var userId_2 = req.user.id;
    var query_2 =
      "UPDATE user_details SET county='" +
      county +
      "', city='" +
      city +
      "',\n                address='" +
      address +
      "', phone='" +
      phone +
      "', zipcode='" +
      zipcode +
      "'\n                WHERE user_id='" +
      req.user.id +
      "' AND id=" +
      req.params.detailsId;
    db_1.default.query(query_2, function (err) {
      if (err) throw err;
      query_2 =
        "SELECT id, county, city, address, phone, zipcode\n       FROM user_details WHERE user_id='" +
        userId_2 +
        "' AND id=" +
        req.params.detailsId;
      db_1.default.query(query_2, function (err, result) {
        if (err) throw err;
        res.status(201).json(result[0]);
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getUserDetails = function (req, res) {
  try {
    var query =
      "\n      SELECT id, county, city, address, phone, zipcode \n      FROM user_details WHERE user_id='" +
      req.user.id +
      "'\n    ";
    db_1.default.query(query, function (err, result) {
      if (err) throw err;
      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.changeUserFirstAndLastNames = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var _a = req.body,
      firstName = _a.firstName,
      lastName = _a.lastName;
    var query =
      "UPDATE users SET first_name='" +
      firstName +
      "', last_name='" +
      lastName +
      "'\n                  WHERE id='" +
      req.user.id +
      "'";
    db_1.default.query(query, function (err) {
      if (err) throw err;
      res.json({
        message: "User first name and last name updated successfully",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.changeEmail = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var email_2 = req.body.email;
    var query_3 = "SELECT * FROM users WHERE email='" + email_2 + "'";
    db_1.default.query(query_3, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(400).json({ error: "Email already taken" });
      }
      query_3 =
        "UPDATE users SET email='" +
        email_2 +
        "' WHERE id='" +
        req.user.id +
        "'";
      db_1.default.query(query_3, function (err) {
        if (err) throw err;
        res.json({ message: "Email updated successfully" });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.changePassword = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var _a = req.body,
      password_2 = _a.password,
      newPassword_1 = _a.newPassword;
    var query_4 = "SELECT * FROM users WHERE id='" + req.user.id + "'";
    db_1.default.query(query_4, function (err, result) {
      return __awaiter(void 0, void 0, void 0, function () {
        var isMatch, salt, encryptedPassword;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (err) throw err;
              return [
                4 /*yield*/,
                bcryptjs_1.compare(password_2, result[0].password),
              ];
            case 1:
              isMatch = _a.sent();
              if (!isMatch) {
                return [
                  2 /*return*/,
                  res
                    .status(401)
                    .json({ error: "False Credentials. User not Authorized" }),
                ];
              }
              return [4 /*yield*/, bcryptjs_1.genSalt(10)];
            case 2:
              salt = _a.sent();
              return [4 /*yield*/, bcryptjs_1.hash(newPassword_1, salt)];
            case 3:
              encryptedPassword = _a.sent();
              query_4 =
                "UPDATE users SET password='" +
                encryptedPassword +
                "' WHERE id='" +
                req.user.id +
                "'";
              db_1.default.query(query_4, function (err) {
                if (err) throw err;
                res.json({ message: "Password updated successfully" });
              });
              return [2 /*return*/];
          }
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.checkIfEmailExists = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var email = req.body.email;
    verifier.verify(email, function (err, data) {
      if (err) throw err;
      var emailIsValid =
        data.disposableCheck &&
        data.disposableCheck === "false" &&
        data.smtpCheck &&
        data.smtpCheck !== "false" &&
        data.dnsCheck &&
        data.dnsCheck !== "false"
          ? true
          : false;
      res.json(emailIsValid);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
