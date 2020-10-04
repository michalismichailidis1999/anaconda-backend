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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientSecret = exports.cardPayment = void 0;
var dotenv_1 = require("dotenv");
var stripe_1 = require("stripe");
var express_validator_1 = require("express-validator");
var errorMessageHandler_1 = require("../helpers/errorMessageHandler");
var uuid_1 = require("uuid");
dotenv_1.config();
var secretKey = process.env.SECRET_KEY || "";
var stripe = new stripe_1.Stripe(secretKey, { apiVersion: "2020-03-02" });
exports.cardPayment = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errors, _a, client_secret, paymentMethod, idempotencyKey, clientSecret;
    return __generator(this, function (_b) {
        try {
            errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errorMessageHandler_1.errorHandler(errors.array()[0]));
                return [2 /*return*/, res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) })];
            }
            _a = req.body, client_secret = _a.client_secret, paymentMethod = _a.paymentMethod;
            idempotencyKey = uuid_1.v4();
            clientSecret = client_secret || "";
            stripe.paymentIntents
                .confirm(clientSecret, {
                payment_method: paymentMethod
            }, { idempotencyKey: idempotencyKey })
                .then(function (confirm) {
                res.status(200).json({ success: true, payment: confirm });
            })
                .catch(function (err) {
                console.log(err);
                res.status(400).json({ success: false, error: err.message });
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
        return [2 /*return*/];
    });
}); };
exports.getClientSecret = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errors, _a, amount, orderId, paymentAmount, id, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                errors = express_validator_1.validationResult(req);
                if (!errors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) })];
                }
                _a = req.body, amount = _a.amount, orderId = _a.orderId;
                if (amount <= 0) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ error: "Something went wrong with the order amount" })];
                }
                paymentAmount = amount * 100;
                return [4 /*yield*/, stripe.paymentIntents.create({
                        amount: paymentAmount,
                        currency: "eur",
                        description: "\u0391\u03C1\u03B9\u03B8\u03BC\u03CC\u03C2 \u03A0\u03B1\u03C1\u03B1\u03B3\u03B3\u03B5\u03BB\u03AF\u03B1\u03C2: " + orderId
                    })];
            case 1:
                id = (_b.sent()).id;
                res.status(200).json(id);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _b.sent();
                console.log(err_1);
                res.status(500).json({ error: err_1.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
