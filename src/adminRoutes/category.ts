import { Router } from "express";
import {
  create,
  remove,
  update,
  getTotalCategoriesNumber
} from "../adminControllers/category";
import {
  requireSignIn,
  isAuthenticated,
  isAdmin,
  userById
} from "../middlewares/user";
import { check } from "express-validator";
import { categoryById } from "../middlewares/category";

const router = Router();

router.delete(
  "/admin/category/:categoryId/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  remove
);

router.post(
  "/admin/category/:userId/create",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  [check("name", "Category name is required").notEmpty()],
  create
);

router.put(
  "/admin/category/:categoryId/:userId/update",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  [check("name", "Category name is required").notEmpty()],
  update
);

router.get(
  "/admin/categories_total_count/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getTotalCategoriesNumber
);

router.param("userId", userById);
router.param("categoryId", categoryById);

export default router;
