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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientSecret = exports.cardPayment = void 0;
const dotenv_1 = require("dotenv");
const stripe_1 = require("stripe");
const express_validator_1 = require("express-validator");
const errorMessageHandler_1 = require("../helpers/errorMessageHandler");
const uuid_1 = require("uuid");
dotenv_1.config();
const secretKey = process.env.SECRET_KEY || "";
const stripe = new stripe_1.Stripe(secretKey, { apiVersion: "2020-03-02" });
exports.cardPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errorMessageHandler_1.errorHandler(errors.array()[0]));
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { client_secret, paymentMethod } = req.body;
        const idempotencyKey = uuid_1.v4();
        const clientSecret = client_secret || "";
        stripe.paymentIntents
            .confirm(clientSecret, {
            payment_method: paymentMethod
        }, { idempotencyKey })
            .then(confirm => {
            res.status(200).json({ success: true, payment: confirm });
        })
            .catch(err => {
            console.log(err);
            res.status(400).json({ success: false, error: err.message });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
exports.getClientSecret = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { amount, orderId } = req.body;
        if (amount <= 0) {
            return res
                .status(400)
                .json({ error: "Something went wrong with the order amount" });
        }
        const paymentAmount = amount * 100;
        const { id } = yield stripe.paymentIntents.create({
            amount: paymentAmount,
            currency: "eur",
            description: `Αριθμός Παραγγελίας: ${orderId}`
        });
        res.status(200).json(id);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
