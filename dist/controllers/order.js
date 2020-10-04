"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = exports.notifyBothAdminAndClientAboutOrder = exports.getTotalPagesOfClientOrders = exports.getOrders = exports.create = void 0;
var db_1 = __importDefault(require("../config/db"));
var express_validator_1 = require("express-validator");
var errorMessageHandler_1 = require("../helpers/errorMessageHandler");
var dotenv_1 = require("dotenv");
var mail_1 = __importDefault(require("@sendgrid/mail"));
dotenv_1.config();
var sgApiKey = process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY : "";
mail_1.default.setApiKey(
  "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"
);
var adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL : "";
var adminEmail2 = process.env.ADMIN_EMAIL_2 ? process.env.ADMIN_EMAIL_2 : "";
exports.create = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var _a = req.body,
      orderId_1 = _a.orderId,
      totalPrice = _a.totalPrice,
      email = _a.email,
      products_1 = _a.products,
      userDetails_1 = _a.userDetails,
      paymentMethod = _a.paymentMethod,
      isPaid = _a.isPaid,
      customerName_1 = _a.customerName,
      extraPrice = _a.extraPrice;
    var query_1 = "";
    var paid = isPaid || 0;
    if (email) {
      query_1 =
        "\n            INSERT INTO orders(id, status, total_price, customer, payment_method, paid, extra_price)\n            VALUES('" +
        orderId_1 +
        "', 'Created', " +
        totalPrice +
        ", '" +
        email +
        "', '" +
        paymentMethod +
        "', " +
        paid +
        ", " +
        extraPrice +
        ")\n        ";
    } else {
      query_1 =
        "\n        INSERT INTO orders(id, status, total_price, payment_method, paid, extra_price)\n        VALUES('" +
        orderId_1 +
        "', 'Created', " +
        totalPrice +
        ", '" +
        paymentMethod +
        "', " +
        paid +
        ", " +
        extraPrice +
        ")\n      ";
    }
    db_1.default.query(query_1, function (err) {
      if (err) throw err;
      products_1.forEach(function (p) {
        query_1 =
          "INSERT INTO order_products(order_id, quantity, price, name, image, weight, code, category_id) \n        VALUES('" +
          orderId_1 +
          "', " +
          p.quantity +
          ", " +
          p.price +
          ", '" +
          p.name +
          "', '" +
          p.image +
          "', " +
          p.weight * p.quantity +
          ", '" +
          p.code +
          "', '" +
          p.category_id +
          "')";
        db_1.default.query(query_1, function (err) {
          if (err) throw err;
        });
      });
      var county = userDetails_1.county,
        city = userDetails_1.city,
        address = userDetails_1.address,
        phone = userDetails_1.phone,
        zipcode = userDetails_1.zipcode;
      query_1 =
        "INSERT INTO order_delivery_details(order_id, county, city, address, phone, zipcode, customer_name)\n      VALUES('" +
        orderId_1 +
        "', '" +
        county +
        "', '" +
        city +
        "', '" +
        address +
        "', '" +
        phone +
        "', '" +
        zipcode +
        "', '" +
        customerName_1 +
        "')";
      db_1.default.query(query_1, function (err) {
        if (err) throw err;
        res.status(200).json({ message: "Order created successfully" });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};
exports.getOrders = function (req, res) {
  try {
    var page = parseInt(req.query.page + "") || 1;
    var query =
      "SELECT id, status, total_price, created_at \n      FROM orders WHERE customer='" +
      req.user.email +
      "'\n      ORDER BY created_at DESC LIMIT " +
      (page - 1) * 5 +
      ", 5";
    db_1.default.query(query, function (err, result) {
      if (err) throw err;
      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getTotalPagesOfClientOrders = function (req, res) {
  try {
    var query =
      "SELECT CEIL(COUNT(*) / 5) as pages FROM orders WHERE customer='" +
      req.user.email +
      "'";
    db_1.default.query(query, function (err, result) {
      if (err) throw err;
      res.json(result[0].pages);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.notifyBothAdminAndClientAboutOrder = function (req, res) {
  try {
    var errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res
        .status(400)
        .json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
    }
    var _a = req.body,
      orderId = _a.orderId,
      totalPrice = _a.totalPrice,
      email = _a.email,
      products = _a.products,
      userDetails = _a.userDetails,
      extraPrice = _a.extraPrice,
      customerName = _a.customerName;
    var dynamicDataToClient = {
      orderId: orderId,
      totalPrice: totalPrice,
      extraPrice: extraPrice,
      products: products,
    };
    if (email) {
      var emailToClient = {
        personalizations: [
          {
            to: [{ email: email }],
            dynamicTemplateData: dynamicDataToClient,
          },
        ],
        from: {
          email: adminEmail,
          name: "Anakonta",
        },
        replyTo: { email: adminEmail, name: "Anakonta" },
        templateId: "d-e2ddea85cb9a47ee852a87e5dedfdbe2",
      };
      mail_1.default.send(emailToClient).catch(function (err) {
        console.log("Message could not sent to client", err);
      });
    }
    var dynamicDataToAdmin = {
      orderId: orderId,
      totalPrice: totalPrice,
      extraPrice: extraPrice,
      userDetails: userDetails,
      customerName: customerName,
    };
    var emailToAdmin = {
      personalizations: [
        {
          to: [{ email: adminEmail }],
          dynamicTemplateData: dynamicDataToAdmin,
        },
      ],
      from: {
        email: adminEmail2,
        name: "Anakonta",
      },
      replyTo: { email: adminEmail2, name: "Anakonta" },
      templateId: "d-ae7413fc5c9e463fa1e33e2720abd9fa",
    };
    mail_1.default.send(emailToAdmin).catch(function (err) {
      console.log("Message could be not sent to admin", err);
    });
    res.status(200).json({
      message: "Notifications have been send to both admin and client",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getOrder = function (req, res) {
  try {
    var query_2 =
      "SELECT customer_name,county, city, address, phone, zipcode \n    FROM order_delivery_details WHERE order_id='" +
      req.order.id +
      "'";
    db_1.default.query(query_2, function (err, result) {
      if (err) throw err;
      var deliveryDetails = result[0];
      query_2 =
        "SELECT name, image, price, quantity \n      FROM order_products WHERE order_id='" +
        req.order.id +
        "'";
      db_1.default.query(query_2, function (err, result) {
        if (err) throw err;
        var products = result;
        var paymentDetails = {
          status: req.order.status,
          total_price: req.order.total_price,
          id: req.order.id,
          payment_method: req.order.paymentMethod,
          paid: req.order.paid,
        };
        res.json({
          deliveryDetails: deliveryDetails,
          products: products,
          paymentDetails: paymentDetails,
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
