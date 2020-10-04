"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var product_1 = require("../adminControllers/product");
var product_2 = require("../middlewares/product");
var user_1 = require("../middlewares/user");
var router = express_1.Router();
router.post("/admin/product/:userId/create", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, product_2.checkForAllFields, product_1.create);
router.post("/admin/product/:userId/upload_image", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, product_1.uploadImage);
router.put("/admin/product/:userId/:productId/update", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, product_2.checkForAllFields, product_1.update);
router.delete("/admin/product/:userId/:productId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, product_1.remove);
router.delete("/admin/product/:userId/admin/comment/:commentId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, product_1.deleteComment);
router.get("/admin/products_total_count/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, product_1.getTotalProductsNumber);
router.get("/admin/products/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, product_1.fetchProducts);
router.get("/admin/product/:productId/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, product_1.fetchProduct);
router.param("userId", user_1.userById);
router.param("productId", product_2.productById);
router.param("commentId", product_2.commentById);
exports.default = router;
