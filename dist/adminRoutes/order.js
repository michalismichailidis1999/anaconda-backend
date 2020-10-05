"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_1 = require("../adminControllers/order");
const user_1 = require("../middlewares/user");
const order_2 = require("../middlewares/order");
const express_validator_1 = require("express-validator");
const router = express_1.Router();
router.get("/admin/orders_total_count/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.getTotalOrderNumber);
router.get("/admin/order/total_profit/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.getTotalProfit);
router.get("/admin/order/avg_monthly_profit/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.getAverageMonthlyProfit);
router.get("/admin/order/monthly_profits/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.getMonthlyProfits);
router.get("/admin/order/categories_total_sales/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.getCategoriesTotalSales);
router.get("/admin/orders/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.fetchOrders);
router.get("/admin/order/:orderId/products/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.fetchOrderProducts);
router.get("/admin/order/:orderId/customer_details/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.fetchOrderCustomerDetails);
router.get("/admin/order/:orderId/details/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.fetchOrderDetails);
router.get("/admin/order/:orderId/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, order_1.getOrderById);
router.put("/admin/order/:orderId/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, [
    express_validator_1.check("status", "Status is required").notEmpty(),
    express_validator_1.check("status", "Status must be Created, Pending, Delivered or Canceled").matches(/^(?:Created|Pending|Delivered|Canceled)$/),
    express_validator_1.check("checked", "Checked is required").notEmpty(),
    express_validator_1.check("checked", "Checked must be 0 or 1").matches(/^(?:0|1)$/)
], order_1.update);
router.param("userId", user_1.userById);
router.param("orderId", order_2.orderById);
exports.default = router;
