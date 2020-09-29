import { Router } from "express";
import {
  getProducts,
  getProduct,
  rateProduct,
  updateProductRating,
  getProductRates,
  createComment,
  deleteComment,
  searchProduct,
  getRecommendations,
  getProductComments
} from "../controllers/product";
import { productById, commentById } from "../middlewares/product";
import { userById, requireSignIn, isAuthenticated } from "../middlewares/user";
import { check } from "express-validator";

const router = Router();

router.get("/products", getProducts);
router.get("/product/:productId", getProduct);

router.post(
  "/product/:userId/:productId/rate",
  requireSignIn,
  isAuthenticated,
  [
    check("stars", "Stars are required in order to rate the product").notEmpty()
  ],
  rateProduct
);

router.put(
  "/product/:userId/:productId/rate",
  requireSignIn,
  isAuthenticated,
  [
    check("stars", "Stars are required in order to rate the product").notEmpty()
  ],
  updateProductRating
);

router.get("/product/:productId/rates", getProductRates);

router.get("/product/:productId/comments", getProductComments);

router.post(
  "/product/:userId/:productId/comment",
  requireSignIn,
  isAuthenticated,
  [check("comment", "Comment is required").notEmpty()],
  createComment
);

router.delete(
  "/product/:userId/comment/:commentId",
  requireSignIn,
  isAuthenticated,
  deleteComment
);

router.post(
  "/product/search",
  [
    check(
      "search",
      "Please type the product name you want to search"
    ).notEmpty()
  ],
  searchProduct
);

router.get("/products/recommendations", getRecommendations);

router.param("userId", userById);
router.param("productId", productById);
router.param("commentId", commentById);

export default router;
