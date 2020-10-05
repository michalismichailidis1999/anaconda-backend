"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_1 = require("../controllers/payment");
const express_validator_1 = require("express-validator");
const router = express_1.Router();
router.post("/payment/charge", payment_1.cardPayment);
router.post("/payment/client_secret", [express_validator_1.check("amount", "Amount is required").notEmpty()], payment_1.getClientSecret);
exports.default = router;
