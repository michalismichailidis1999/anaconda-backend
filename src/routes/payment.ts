import { Router } from "express";
import { cardPayment, getClientSecret } from "../controllers/payment";
import { check } from "express-validator";

const router = Router();

router.post("/payment/charge", cardPayment);

router.post(
  "/payment/client_secret",
  [check("amount", "Amount is required").notEmpty()],
  getClientSecret
);

export default router;
