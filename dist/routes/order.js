"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var order_1 = require("../controllers/order");
var user_1 = require("../middlewares/user");
var express_validator_1 = require("express-validator");
var order_2 = require("../middlewares/order");
var router = express_1.Router();
router.post("/order/create", [
    express_validator_1.check("orderId", "Order ID is required").notEmpty(),
    express_validator_1.check("totalPrice", "Total price is required").notEmpty(),
    express_validator_1.check("products", "Products are required").notEmpty(),
    express_validator_1.check("userDetails", "User details are required").notEmpty(),
    express_validator_1.check("customerName", "Customer name is required").notEmpty(),
    express_validator_1.check("isPaid", "isPaid variable is required").notEmpty(),
    express_validator_1.check("paymentMethod", "Payment method is required").notEmpty(),
    express_validator_1.check("extraPrice", "Extra price is required").notEmpty()
], order_1.create);
router.post("/order/send_notification", [
    express_validator_1.check("orderId", "Order ID is required").notEmpty(),
    express_validator_1.check("totalPrice", "Total price is required").notEmpty(),
    express_validator_1.check("products", "Products are required").notEmpty(),
    express_validator_1.check("userDetails", "User details are required").notEmpty(),
    express_validator_1.check("extraPrice", "Extra price is required").notEmpty(),
    express_validator_1.check("customerName", "Customer name is required").notEmpty()
], order_1.notifyBothAdminAndClientAboutOrder);
router.get("/order/:userId", user_1.requireSignIn, user_1.isAuthenticated, order_1.getOrders);
router.get("/order/total_pages/:userId", user_1.requireSignIn, user_1.isAuthenticated, order_1.getTotalPagesOfClientOrders);
router.get("/order/:orderId/:userId", user_1.requireSignIn, user_1.isAuthenticated, order_1.getOrder);
router.param("userId", user_1.userById);
router.param("orderId", order_2.orderById);
exports.default = router;
