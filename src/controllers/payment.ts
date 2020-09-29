import { Request, Response } from "express";
import { config } from "dotenv";
import { Stripe } from "stripe";
import { validationResult } from "express-validator";
import { errorHandler } from "../helpers/errorMessageHandler";
import { v4 } from "uuid";

config();

const secretKey = process.env.SECRET_KEY || "";

const stripe = new Stripe(secretKey, { apiVersion: "2020-03-02" });

export const cardPayment = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errorHandler(errors.array()[0]));
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { client_secret, paymentMethod } = req.body;

    const idempotencyKey = v4();

    const clientSecret = client_secret || "";

    stripe.paymentIntents
      .confirm(
        clientSecret,
        {
          payment_method: paymentMethod
        },
        { idempotencyKey }
      )
      .then(confirm => {
        res.status(200).json({ success: true, payment: confirm });
      })
      .catch(err => {
        console.log(err);

        res.status(400).json({ success: false, error: err.message });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getClientSecret = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { amount, orderId } = req.body;

    if (amount <= 0) {
      return res
        .status(400)
        .json({ error: "Something went wrong with the order amount" });
    }

    const paymentAmount = amount * 100;

    const { id } = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: "eur",
      description: `Αριθμός Παραγγελίας: ${orderId}`
    });

    res.status(200).json(id);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
