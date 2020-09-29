import { Router } from "express";
import {
  create,
  update,
  uploadImage,
  remove,
  deleteComment,
  getTotalProductsNumber,
  fetchProducts,
  fetchProduct,
} from "../adminControllers/product";
import {
  productById,
  commentById,
  checkForAllFields,
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
  checkForAllFields,
  create
);

router.post(
  "/admin/product/:userId/upload_image",
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
  checkForAllFields,
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

router.param("userId", userById);
router.param("productId", productById);
router.param("commentId", commentById);

export default router;
