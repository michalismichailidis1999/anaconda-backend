import { Router } from "express";
import {
  create,
  getOrders,
  notifyBothAdminAndClientAboutOrder,
  getTotalPagesOfClientOrders,
  getOrder,
  searchOrder
} from "../controllers/order";
import { userById, requireSignIn, isAuthenticated } from "../middlewares/user";
import { check } from "express-validator";
import { orderById } from "../middlewares/order";

const router = Router();

router.post(
  "/order/create",
  [
    check("orderId", "Order ID is required").notEmpty(),
    check("totalPrice", "Total price is required").notEmpty(),
    check("products", "Products are required").notEmpty(),
    check("userDetails", "User details are required").notEmpty(),
    check("customerName", "Customer name is required").notEmpty(),
    check("isPaid", "isPaid variable is required").notEmpty(),
    check("paymentMethod", "Payment method is required").notEmpty(),
    check("extraPrice", "Extra price is required").notEmpty()
  ],
  create
);

router.post(
  "/order/send_notification",
  [
    check("orderId", "Order ID is required").notEmpty(),
    check("totalPrice", "Total price is required").notEmpty(),
    check("products", "Products are required").notEmpty(),
    check("userDetails", "User details are required").notEmpty(),
    check("extraPrice", "Extra price is required").notEmpty(),
    check("customerName", "Customer name is required").notEmpty()
  ],
  notifyBothAdminAndClientAboutOrder
);

router.get("/order/:userId", requireSignIn, isAuthenticated, getOrders);

router.get(
  "/order/total_pages/:userId",
  requireSignIn,
  isAuthenticated,
  getTotalPagesOfClientOrders
);

router.get("/order/:orderId/:userId", requireSignIn, isAuthenticated, getOrder);

router.post("/check_my_order", [check("id", "Order id is required")], searchOrder);

router.param("userId", userById);
router.param("orderId", orderById);

export default router;
