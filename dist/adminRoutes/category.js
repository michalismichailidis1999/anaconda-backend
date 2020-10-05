"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_1 = require("../adminControllers/category");
const user_1 = require("../middlewares/user");
const express_validator_1 = require("express-validator");
const category_2 = require("../middlewares/category");
const router = express_1.Router();
router.delete("/admin/category/:categoryId/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, category_1.remove);
router.post("/admin/category/:userId/create", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, [express_validator_1.check("name", "Category name is required").notEmpty()], category_1.create);
router.put("/admin/category/:categoryId/:userId/update", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, [express_validator_1.check("name", "Category name is required").notEmpty()], category_1.update);
router.get("/admin/categories_total_count/:userId", user_1.requireSignIn, user_1.isAuthenticated, user_1.isAdmin, category_1.getTotalCategoriesNumber);
router.param("userId", user_1.userById);
router.param("categoryId", category_2.categoryById);
exports.default = router;
