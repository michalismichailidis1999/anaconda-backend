"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const express_validator_1 = require("express-validator");
const user_2 = require("../middlewares/user");
const router = express_1.Router();
router.post("/user/signup", [
    express_validator_1.check("firstName", "First name is required").notEmpty(),
    express_validator_1.check("firstName", "First name must be 2-100 characters").isLength({
        min: 2,
        max: 100,
    }),
    express_validator_1.check("lastName", "Last name is required").notEmpty(),
    express_validator_1.check("lastName", "Last name must be 2-100 characters").isLength({
        min: 2,
        max: 100,
    }),
    express_validator_1.check("email", "Email is required").notEmpty(),
    express_validator_1.check("email", "Please enter a valid email").isEmail(),
    express_validator_1.check("email", "Email can be at max 150 characters").isLength({ max: 150 }),
    express_validator_1.check("password", "Password is required").notEmpty(),
    express_validator_1.check("password", "Password must be at least 8 characters").isLength({
        min: 8,
    }),
], user_1.signup);
router.post("/user/signin", [
    express_validator_1.check("email", "Email is required").notEmpty(),
    express_validator_1.check("email", "Please enter a valid email").isEmail(),
    express_validator_1.check("password", "Password is required").notEmpty(),
], user_1.signin);
router.put("/user/:userId/details/:detailsId/update", user_2.requireSignIn, user_2.isAuthenticated, [
    express_validator_1.check("county", "County is required").notEmpty(),
    express_validator_1.check("city", "City is required").notEmpty(),
    express_validator_1.check("address", "Address is required").notEmpty(),
    express_validator_1.check("phone", "Phone is required").notEmpty(),
    express_validator_1.check("zipcode", "Zipcode is required").notEmpty(),
], user_1.updateDetails);
router.put("/user/:userId/name/update", user_2.requireSignIn, user_2.isAuthenticated, [
    express_validator_1.check("firstName", "First name is required").notEmpty(),
    express_validator_1.check("firstName", "First name must be 2-100 characters").isLength({
        min: 2,
        max: 100,
    }),
    express_validator_1.check("lastName", "Last name is required").notEmpty(),
    express_validator_1.check("lastName", "Last name must be 2-100 characters").isLength({
        min: 2,
        max: 100,
    }),
], user_1.changeUserFirstAndLastNames);
router.put("/user/:userId/email/update", user_2.requireSignIn, user_2.isAuthenticated, [
    express_validator_1.check("email", "Email is required").notEmpty(),
    express_validator_1.check("email", "Please enter a valid email").isEmail(),
    express_validator_1.check("email", "Email can be at max 150 characters").isLength({ max: 150 }),
], user_1.changeEmail);
router.put("/user/:userId/password/update", user_2.requireSignIn, user_2.isAuthenticated, [
    express_validator_1.check("password", "Password is required").notEmpty(),
    express_validator_1.check("password", "Password must be at least 8 characters").isLength({
        min: 8,
    }),
], user_1.changePassword);
router.get("/user/:userId/details", user_2.requireSignIn, user_2.isAuthenticated, user_1.getUserDetails);
router.post("/email_exists", [
    express_validator_1.check("email", "Email is required").notEmpty(),
    express_validator_1.check("email", "Please enter a valid email").isEmail(),
], user_1.checkIfEmailExists);
router.param("userId", user_2.userById);
exports.default = router;
