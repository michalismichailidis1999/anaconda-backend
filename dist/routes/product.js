"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var product_1 = require("../controllers/product");
var product_2 = require("../middlewares/product");
var user_1 = require("../middlewares/user");
var express_validator_1 = require("express-validator");
var router = express_1.Router();
router.get("/products", product_1.getProducts);
router.get("/product/:productId", product_1.getProduct);
router.post("/product/:userId/:productId/rate", user_1.requireSignIn, user_1.isAuthenticated, [
    express_validator_1.check("stars", "Stars are required in order to rate the product").notEmpty()
], product_1.rateProduct);
router.put("/product/:userId/:productId/rate", user_1.requireSignIn, user_1.isAuthenticated, [
    express_validator_1.check("stars", "Stars are required in order to rate the product").notEmpty()
], product_1.updateProductRating);
router.get("/product/:productId/rates", product_1.getProductRates);
router.get("/product/:productId/comments", product_1.getProductComments);
router.post("/product/:userId/:productId/comment", user_1.requireSignIn, user_1.isAuthenticated, [express_validator_1.check("comment", "Comment is required").notEmpty()], product_1.createComment);
router.delete("/product/:userId/comment/:commentId", user_1.requireSignIn, user_1.isAuthenticated, product_1.deleteComment);
router.post("/product/search", [
    express_validator_1.check("search", "Please type the product name you want to search").notEmpty()
], product_1.searchProduct);
router.get("/products/recommendations", product_1.getRecommendations);
router.param("userId", user_1.userById);
router.param("productId", product_2.productById);
router.param("commentId", product_2.commentById);
exports.default = router;
