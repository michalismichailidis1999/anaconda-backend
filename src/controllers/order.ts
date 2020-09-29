interface OrderProduct {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  weight: number;
  code: string;
}

import { Request, Response } from "express";
import db from "../config/db";
import { MysqlError } from "mysql";
import { validationResult } from "express-validator";
import { errorHandler } from "../helpers/errorMessageHandler";
import { config } from "dotenv";
import sgMail from "@sendgrid/mail";

config();

const sgApiKey = process.env.SENDGRID_API_KEY
  ? process.env.SENDGRID_API_KEY
  : "";

sgMail.setApiKey(sgApiKey);

export const create = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const {
      orderId,
      totalPrice,
      email,
      products,
      userDetails,
      paymentMethod,
      isPaid,
      customerName,
      extraPrice
    } = req.body;

    let query = "";

    let paid = isPaid || 0;

    if (email) {
      query = `
            INSERT INTO orders(id, status, total_price, customer, payment_method, paid, extra_price)
            VALUES('${orderId}', 'Created', ${totalPrice}, '${email}', '${paymentMethod}', ${paid}, ${extraPrice})
        `;
    } else {
      query = `
        INSERT INTO orders(id, status, total_price, payment_method, paid, extra_price)
        VALUES('${orderId}', 'Created', ${totalPrice}, '${paymentMethod}', ${paid}, ${extraPrice})
      `;
    }

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      products.forEach((p: OrderProduct) => {
        query = `INSERT INTO order_products(order_id, quantity, price, name, image, weight, code, category_id) 
        VALUES('${orderId}', ${p.quantity}, ${p.price}, '${p.name}', '${
          p.image
        }', ${p.weight * p.quantity}, '${p.code}', '${p.category_id}')`;

        db.query(query, (err: MysqlError) => {
          if (err) throw err;
        });
      });

      const { county, city, address, phone, zipcode } = userDetails;

      query = `INSERT INTO order_delivery_details(order_id, county, city, address, phone, zipcode, customer_name)
      VALUES('${orderId}', '${county}', '${city}', '${address}', '${phone}', '${zipcode}', '${customerName}')`;

      db.query(query, (err: MysqlError) => {
        if (err) throw err;

        res.status(200).json({ message: "Order created successfully" });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

export const getOrders = (req: Request, res: Response) => {
  try {
    let page = parseInt(req.query.page + "") || 1;

    let query = `SELECT id, status, total_price, created_at 
      FROM orders WHERE customer='${req.user.email}'
      ORDER BY created_at DESC LIMIT ${(page - 1) * 5}, 5`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getTotalPagesOfClientOrders = (req: Request, res: Response) => {
  try {
    let query = `SELECT CEIL(COUNT(*) / 5) as pages FROM orders WHERE customer='${req.user.email}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0].pages);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const notifyBothAdminAndClientAboutOrder = (
  req: Request,
  res: Response
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const {
      orderId,
      totalPrice,
      email,
      products,
      userDetails,
      extraPrice,
      customerName
    } = req.body;

    const dynamicDataToClient = {
      orderId,
      totalPrice,
      extraPrice,
      products
    };

    if (email) {
      const emailToClient = {
        personalizations: [
          {
            to: [{ email: "michalismichailidis1999@gmail.com" }],
            dynamicTemplateData: dynamicDataToClient
          }
        ],
        from: {
          email: "mixalismixailidis857@gmail.com",
          name: "Anakonta"
        },
        replyTo: { email: "mixalismixailidis857@gmail.com", name: "Anakonta" },
        templateId: "d-e2ddea85cb9a47ee852a87e5dedfdbe2"
      };

      sgMail.send(emailToClient).catch(err => {
        console.log("Message could not sent to client", err);
      });
    }

    const dynamicDataToAdmin = {
      orderId,
      totalPrice,
      extraPrice,
      userDetails,
      customerName
    };

    const emailToAdmin = {
      personalizations: [
        {
          to: [{ email: "mixalismixailidis857@gmail.com" }],
          dynamicTemplateData: dynamicDataToAdmin
        }
      ],
      from: {
        email: "michalismichailidis1999@gmail.com",
        name: "Anakonta"
      },
      replyTo: { email: "michalismichailidis1999@gmail.com", name: "Anakonta" },
      templateId: "d-ae7413fc5c9e463fa1e33e2720abd9fa"
    };

    sgMail.send(emailToAdmin).catch(err => {
      console.log("Message could be not sent to admin", err);
    });

    res.status(200).json({
      message: "Notifications have been send to both admin and client"
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getOrder = (req: Request, res: Response) => {
  try {
    let query = `SELECT customer_name,county, city, address, phone, zipcode 
    FROM order_delivery_details WHERE order_id='${req.order.id}'`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      let deliveryDetails = result[0];

      query = `SELECT name, image, price, quantity 
      FROM order_products WHERE order_id='${req.order.id}'`;

      db.query(query, (err: MysqlError, result) => {
        if (err) throw err;

        let products = result;

        let paymentDetails = {
          status: req.order.status,
          total_price: req.order.total_price,
          id: req.order.id,
          payment_method: req.order.paymentMethod,
          paid: req.order.paid
        };

        res.json({ deliveryDetails, products, paymentDetails });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
