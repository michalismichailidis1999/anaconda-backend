import { Router } from "express";
import { check } from "express-validator";
import {
  create,
  update,
  uploadImage,
  remove,
  deleteComment,
  getTotalProductsNumber,
  fetchProducts,
  fetchProduct,
  getProductImages
} from "../adminControllers/product";
import {
  productById,
  commentById,
} from "../middlewares/product";
import {
  userById,
  requireSignIn,
  isAuthenticated,
  isAdmin,
} from "../middlewares/user";

const router = Router();

router.post(
  "/admin/product/:userId/create",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  [
    check("name", "Name is required").notEmpty(),
    check("name", 'Name must be at least 2 characters and less than 100').isLength({min: 2, max: 99}),
    check("category_id", "Category id is required").notEmpty(),
    check("price", "Price is required").notEmpty(),
    check("price", "Price must be a positive intiger").isInt({min: 1}),
    check("description", "Description is required").notEmpty(),
    check("description", "Description must be at least 15 characters").isLength({min: 10}),
    check("quantity", "Quantity is required").notEmpty(),
    check("quantity", "Quantity must be a positive intiger").isInt({min: 1}),
    check("weight", "Weight is required").notEmpty(),
    check("weight", "Weight must be a float number between 1 and 100").isFloat({min: 1, max: 100}),
    check("image", "Image is required").notEmpty(),
  ],
  create
);

router.post(
  "/admin/image/:userId/upload_image",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  uploadImage
);

router.put(
  "/admin/product/:userId/:productId/update",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  [
    check("name", "Name is required").notEmpty(),
    check("name", 'Name must be at least 2 characters and less than 100').isLength({min: 2, max: 99}),
    check("category_id", "Category id is required").notEmpty(),
    check("price", "Price is required").notEmpty(),
    check("price", "Price must be a positive intiger").isInt({min: 1}),
    check("description", "Description is required").notEmpty(),
    check("description", "Description must be at least 15 characters").isLength({min: 10}),
    check("quantity", "Quantity is required").notEmpty(),
    check("quantity", "Quantity must be a positive intiger").isInt({min: 1}),
    check("weight", "Weight is required").notEmpty(),
    check("weight", "Weight must be a float number between 1 and 100").isFloat({min: 1, max: 100}),
    check("on_sale", "Sale is required").notEmpty(),
    check("on_sale", "Sale must be either 0 or 1").matches(/^0|1$/),
    check("new_price", "New price is required").notEmpty(),
    check("new_price", "New price must be a positive intiger or 0").isInt({min: 0})
  ],
  update
);

router.delete(
  "/admin/product/:userId/:productId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  remove
);

router.delete(
  "/admin/product/:userId/admin/comment/:commentId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  deleteComment
);

router.get(
  "/admin/products_total_count/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getTotalProductsNumber
);

router.get(
  "/admin/products/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  fetchProducts
);

router.get(
  "/admin/product/:productId/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  fetchProduct
);

router.get("/admin/product_images/:userId", requireSignIn, isAuthenticated, isAdmin, getProductImages);

router.param("userId", userById);
router.param("productId", productById);
router.param("commentId", commentById);

export default router;
