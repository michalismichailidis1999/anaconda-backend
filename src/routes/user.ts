import { Router } from "express";
import {
  signup,
  signin,
  updateDetails,
  getUserDetails,
  changeEmail,
  changePassword,
  changeUserFirstAndLastNames
} from "../controllers/user";
import { check } from "express-validator";
import { userById, requireSignIn, isAuthenticated } from "../middlewares/user";

const router = Router();

router.post(
  "/user/signup",
  [
    check("firstName", "First name is required").notEmpty(),
    check("firstName", "First name must be 2-100 characters").isLength({
      min: 2,
      max: 100
    }),
    check("lastName", "Last name is required").notEmpty(),
    check("lastName", "Last name must be 2-100 characters").isLength({
      min: 2,
      max: 100
    }),
    check("email", "Email is required").notEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("email", "Email can be at max 150 characters").isLength({ max: 150 }),
    check("password", "Password is required").notEmpty(),
    check("password", "Password must be at least 8 characters").isLength({
      min: 8
    })
  ],
  signup
);

router.post(
  "/user/signin",
  [
    check("email", "Email is required").notEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password is required").notEmpty()
  ],
  signin
);

router.put(
  "/user/:userId/details/:detailsId/update",
  requireSignIn,
  isAuthenticated,
  [
    check("county", "County is required").notEmpty(),
    check("city", "City is required").notEmpty(),
    check("address", "Address is required").notEmpty(),
    check("phone", "Phone is required").notEmpty(),
    check("zipcode", "Zipcode is required").notEmpty()
  ],
  updateDetails
);

router.put(
  "/user/:userId/name/update",
  requireSignIn,
  isAuthenticated,
  [
    check("firstName", "First name is required").notEmpty(),
    check("firstName", "First name must be 2-100 characters").isLength({
      min: 2,
      max: 100
    }),
    check("lastName", "Last name is required").notEmpty(),
    check("lastName", "Last name must be 2-100 characters").isLength({
      min: 2,
      max: 100
    })
  ],
  changeUserFirstAndLastNames
);

router.put(
  "/user/:userId/email/update",
  requireSignIn,
  isAuthenticated,
  [
    check("email", "Email is required").notEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("email", "Email can be at max 150 characters").isLength({ max: 150 })
  ],
  changeEmail
);

router.put(
  "/user/:userId/password/update",
  requireSignIn,
  isAuthenticated,
  [
    check("password", "Password is required").notEmpty(),
    check("password", "Password must be at least 8 characters").isLength({
      min: 8
    })
  ],
  changePassword
);

router.get(
  "/user/:userId/details",
  requireSignIn,
  isAuthenticated,
  getUserDetails
);

router.param("userId", userById);

export default router;
