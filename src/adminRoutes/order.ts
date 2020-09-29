import { Router } from "express";
import {
  getTotalOrderNumber,
  getTotalProfit,
  getAverageMonthlyProfit,
  getMonthlyProfits,
  getCategoriesTotalSales,
  fetchOrders,
  fetchOrderCustomerDetails,
  fetchOrderDetails,
  fetchOrderProducts,
  getOrderById,
  update
} from "../adminControllers/order";
import {
  requireSignIn,
  isAuthenticated,
  isAdmin,
  userById
} from "../middlewares/user";
import { orderById } from "../middlewares/order";
import { check } from "express-validator";

const router = Router();

router.get(
  "/admin/orders_total_count/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getTotalOrderNumber
);

router.get(
  "/admin/order/total_profit/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getTotalProfit
);

router.get(
  "/admin/order/avg_monthly_profit/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getAverageMonthlyProfit
);

router.get(
  "/admin/order/monthly_profits/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getMonthlyProfits
);

router.get(
  "/admin/order/categories_total_sales/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getCategoriesTotalSales
);

router.get(
  "/admin/orders/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  fetchOrders
);

router.get(
  "/admin/order/:orderId/products/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  fetchOrderProducts
);

router.get(
  "/admin/order/:orderId/customer_details/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  fetchOrderCustomerDetails
);

router.get(
  "/admin/order/:orderId/details/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  fetchOrderDetails
);

router.get(
  "/admin/order/:orderId/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getOrderById
);

router.put(
  "/admin/order/:orderId/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  [
    check("status", "Status is required").notEmpty(),
    check(
      "status",
      "Status must be Created, Pending, Delivered or Canceled"
    ).matches(/^(?:Created|Pending|Delivered|Canceled)$/),
    check("checked", "Checked is required").notEmpty(),
    check("checked", "Checked must be 0 or 1").matches(/^(?:0|1)$/)
  ],
  update
);

router.param("userId", userById);
router.param("orderId", orderById);

export default router;
