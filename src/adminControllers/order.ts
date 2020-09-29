import { Request, Response } from "express";
import { MysqlError } from "mysql";
import db from "../config/db";
import { validationResult } from "express-validator";
import { errorHandler } from "../helpers/errorMessageHandler";

export const getTotalOrderNumber = (req: Request, res: Response) => {
  try {
    let query = `SELECT COUNT(*) as total FROM orders`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getTotalProfit = (req: Request, res: Response) => {
  try {
    let query = `SELECT SUM(total_price + extra_price) as total_profit FROM orders`;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getAverageMonthlyProfit = (req: Request, res: Response) => {
  try {
    let query = `
    SELECT ROUND(AVG(profits.profit)) as avg_monthly_profit FROM (
      SELECT YEAR(created_at) as year, MONTH(created_at) as month,
      SUM(total_price + extra_price) as profit FROM orders 
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at)
    ) as profits;
    `;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyProfits = (req: Request, res: Response) => {
  try {
    let query = `
    SELECT YEAR(created_at) as year, MONTH(created_at) as month,
    SUM(total_price + extra_price) as profit FROM orders 
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY YEAR(created_at), MONTH(created_at)
    LIMIT 0,12
    `;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getCategoriesTotalSales = (req: Request, res: Response) => {
  try {
    let query = `
    SELECT c.name as category, COUNT(*) as total_product_sales FROM order_products as op
    INNER JOIN categories as c ON c.id=op.category_id GROUP BY c.name
    `;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const fetchOrders = (req: Request, res: Response) => {
  try {
    let query: string;

    let all = req.query.all === "" ? true : false;
    let newOrders = req.query.new === "" ? true : false;
    let paid = req.query.paid === "" ? true : false;
    let unpaid = req.query.unpaid === "" ? true : false;
    let checked = req.query.checked === "" ? true : false;

    if (all) {
      query = "SELECT id, checked FROM orders";
    } else if (newOrders) {
      query = `
      SELECT id, checked FROM orders 
      WHERE YEAR(created_at)=YEAR(NOW()) AND MONTH(created_at)=MONTH(NOW()) AND DAY(created_at)=DAY(NOW())
      `;
    } else if (paid) {
      query = "SELECT id, checked FROM orders WHERE paid IS TRUE";
    } else if (unpaid) {
      query = "SELECT id, checked FROM orders WHERE paid IS FALSE";
    } else if (checked) {
      query = "SELECT id, checked FROM orders WHERE checked IS TRUE";
    } else {
      query = "SELECT id, checked FROM orders WHERE checked IS FALSE";
    }

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const fetchOrderProducts = (req: Request, res: Response) => {
  try {
    let query = `
    SELECT op.image,op.name,op.price,op.quantity,op.weight,op.code,c.name AS category
    FROM order_products AS op INNER JOIN categories as c ON c.id=op.category_id WHERE op.order_id='${req.order.id}';
    `;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const fetchOrderCustomerDetails = (req: Request, res: Response) => {
  try {
    let query = `
    SELECT odd.county, odd.city, odd.address, odd.phone, odd.zipcode, odd.customer_name, o.customer as customer_email
    FROM order_delivery_details AS odd INNER JOIN orders AS o ON o.id=odd.order_id WHERE odd.order_id='${req.order.id}'
    `;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const fetchOrderDetails = (req: Request, res: Response) => {
  try {
    let query = `
    SELECT o.checked,o.status, o.created_at, o.total_price, o.extra_price, SUM(op.weight * op.quantity) as total_weight, o.payment_method, o.paid, o.created_at
    FROM orders AS o INNER JOIN order_products AS op ON o.id=op.order_id WHERE o.id='${req.order.id}'
    `;

    db.query(query, (err: MysqlError, result) => {
      if (err) throw err;

      res.json(result[0]);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getOrderById = (req: Request, res: Response) => {
  try {
    res.json([{ id: req.order.id, checked: req.order.checked }]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const update = (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errorHandler(errors.array()[0]) });
    }

    const { status, checked } = req.body;

    let query = `
      UPDATE orders SET status='${status}', checked=${checked} WHERE id='${req.order.id}'
    `;

    db.query(query, (err: MysqlError) => {
      if (err) throw err;

      res.json({ message: "Order updated successfully" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
