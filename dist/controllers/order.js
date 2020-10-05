"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = exports.notifyBothAdminAndClientAboutOrder = exports.getTotalPagesOfClientOrders = exports.getOrders = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
const errorMessageHandler_1 = require("../helpers/errorMessageHandler");
const dotenv_1 = require("dotenv");
const mail_1 = __importDefault(require("@sendgrid/mail"));
dotenv_1.config();
const sgApiKey = process.env.SENDGRID_API_KEY
    ? process.env.SENDGRID_API_KEY
    : "";
mail_1.default.setApiKey(sgApiKey);
const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL : "";
const adminEmail2 = process.env.ADMIN_EMAIL_2 ? process.env.ADMIN_EMAIL_2 : "";
exports.create = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { orderId, totalPrice, email, products, userDetails, paymentMethod, isPaid, customerName, extraPrice, } = req.body;
        let query = "";
        let paid = isPaid || 0;
        if (email) {
            query = `
            INSERT INTO orders(id, status, total_price, customer, payment_method, paid, extra_price)
            VALUES('${orderId}', 'Created', ${totalPrice}, '${email}', '${paymentMethod}', ${paid}, ${extraPrice})
        `;
        }
        else {
            query = `
        INSERT INTO orders(id, status, total_price, payment_method, paid, extra_price)
        VALUES('${orderId}', 'Created', ${totalPrice}, '${paymentMethod}', ${paid}, ${extraPrice})
      `;
        }
        db_1.default.query(query, (err) => {
            if (err)
                throw err;
            products.forEach((p) => {
                query = `INSERT INTO order_products(order_id, quantity, price, name, image, weight, code, category_id) 
        VALUES('${orderId}', ${p.quantity}, ${p.price}, '${p.name}', '${p.image}', ${p.weight * p.quantity}, '${p.code}', '${p.category_id}')`;
                db_1.default.query(query, (err) => {
                    if (err)
                        throw err;
                });
            });
            const { county, city, address, phone, zipcode } = userDetails;
            query = `INSERT INTO order_delivery_details(order_id, county, city, address, phone, zipcode, customer_name)
      VALUES('${orderId}', '${county}', '${city}', '${address}', '${phone}', '${zipcode}', '${customerName}')`;
            db_1.default.query(query, (err) => {
                if (err)
                    throw err;
                res.status(200).json({ message: "Order created successfully" });
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
};
exports.getOrders = (req, res) => {
    try {
        let page = parseInt(req.query.page + "") || 1;
        let query = `SELECT id, status, total_price, created_at 
      FROM orders WHERE customer='${req.user.email}'
      ORDER BY created_at DESC LIMIT ${(page - 1) * 5}, 5`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            res.json(result);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getTotalPagesOfClientOrders = (req, res) => {
    try {
        let query = `SELECT CEIL(COUNT(*) / 5) as pages FROM orders WHERE customer='${req.user.email}'`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            res.json(result[0].pages);
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.notifyBothAdminAndClientAboutOrder = (req, res) => {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({ error: errorMessageHandler_1.errorHandler(errors.array()[0]) });
        }
        const { orderId, totalPrice, email, products, userDetails, extraPrice, customerName, } = req.body;
        const dynamicDataToClient = {
            orderId,
            totalPrice,
            extraPrice,
            products,
        };
        if (email) {
            const emailToClient = {
                personalizations: [
                    {
                        to: [{ email }],
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
            mail_1.default.send(emailToClient).catch((err) => {
                console.log("Message could not sent to client", err);
            });
        }
        const dynamicDataToAdmin = {
            orderId,
            totalPrice,
            extraPrice,
            userDetails,
            customerName,
        };
        const emailToAdmin = {
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
        mail_1.default.send(emailToAdmin).catch((err) => {
            console.log("Message could be not sent to admin", err);
        });
        res.status(200).json({
            message: "Notifications have been send to both admin and client",
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getOrder = (req, res) => {
    try {
        let query = `SELECT customer_name,county, city, address, phone, zipcode 
    FROM order_delivery_details WHERE order_id='${req.order.id}'`;
        db_1.default.query(query, (err, result) => {
            if (err)
                throw err;
            let deliveryDetails = result[0];
            query = `SELECT name, image, price, quantity 
      FROM order_products WHERE order_id='${req.order.id}'`;
            db_1.default.query(query, (err, result) => {
                if (err)
                    throw err;
                let products = result;
                let paymentDetails = {
                    status: req.order.status,
                    total_price: req.order.total_price,
                    id: req.order.id,
                    payment_method: req.order.paymentMethod,
                    paid: req.order.paid,
                };
                res.json({ deliveryDetails, products, paymentDetails });
            });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
