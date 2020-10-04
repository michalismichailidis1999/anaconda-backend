"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var user_1 = require("../adminControllers/user");
var express_validator_1 = require("express-validator");
var user_2 = require("../middlewares/user");
var router = express_1.Router();
router.post("/admin/login", [
    express_validator_1.check("email", "Email is required").notEmpty(),
    express_validator_1.check("email", "Please enter a valid email").isEmail(),
    express_validator_1.check("password", "Password is required").notEmpty(),
], user_1.adminLogin);
router.post("/admin/validate_login", [
    express_validator_1.check("email", "Email is required").notEmpty(),
    express_validator_1.check("email", "Please enter a valid email").isEmail(),
    express_validator_1.check("password", "Password is required").notEmpty(),
], user_1.adminExtraSecurity);
router.put("/admin/extra_password/:userId", user_2.requireSignIn, user_2.isAuthenticated, user_2.isAdmin, [
    express_validator_1.check("password", "Password is required").notEmpty(),
    express_validator_1.check("password", "Password must be at least 8 characters").isLength({
        min: 8,
    }),
], user_1.updateAdminExtraPassword);
router.get("/admins/:userId", user_2.requireSignIn, user_2.isAuthenticated, user_2.isAdmin, user_1.getAdmins);
router.put("/admin/lock_admin_area/:userId", user_2.requireSignIn, user_2.isAuthenticated, user_2.isAdmin, user_1.lockAdminArea);
router.put("/admin/unlock_admin_area/:userId", user_2.requireSignIn, user_2.isAuthenticated, user_2.isAdmin, user_1.unlockAdminArea);
router.post("/admin/create/:userId", user_2.requireSignIn, user_2.isAuthenticated, user_2.isAdmin, [
    express_validator_1.check("firstName", "First name is required").notEmpty(),
    express_validator_1.check("lastName", "Last name is required").notEmpty(),
    express_validator_1.check("email", "Email is required").notEmpty(),
    express_validator_1.check("email", "Please enter a valid email").isEmail(),
    express_validator_1.check("password", "Password is required").notEmpty(),
    express_validator_1.check("password", "Password must be at least 8 characters").isLength({
        min: 8,
    }),
    express_validator_1.check("extraPassword", "Extra password is required").notEmpty(),
    express_validator_1.check("extraPassword", "Extra password must be at least 8 characters").isLength({ min: 8 }),
], user_1.createAdmin);
router.delete("/admin/:adminId/:userId", user_2.requireSignIn, user_2.isAuthenticated, user_2.isAdmin, user_1.deleteAdmin);
router.get("/admin/admin_area_status/:userId", user_2.requireSignIn, user_2.isAuthenticated, user_2.isAdmin, user_1.getAdminAreaCurrentStatus);
router.get("/admin/users_total_count/:userId", user_2.requireSignIn, user_2.isAuthenticated, user_2.isAdmin, user_1.getTotalUsersNumber);
router.get("/admin/users/:userId", user_2.requireSignIn, user_2.isAuthenticated, user_2.isAdmin, user_1.getUsers);
router.param("userId", user_2.userById);
exports.default = router;
