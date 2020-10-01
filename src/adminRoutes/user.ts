import { Router } from "express";
import {
  adminLogin,
  adminExtraSecurity,
  updateAdminExtraPassword,
  getAdmins,
  unlockAdminArea,
  createAdmin,
  lockAdminArea,
  getAdminAreaCurrentStatus,
  deleteAdmin,
  getTotalUsersNumber,
  getUsers,
} from "../adminControllers/user";
import { check } from "express-validator";
import {
  userById,
  requireSignIn,
  isAuthenticated,
  isAdmin,
} from "../middlewares/user";

const router = Router();

router.post(
  "/admin/login",
  [
    check("email", "Email is required").notEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password is required").notEmpty(),
  ],
  adminLogin
);

router.post(
  "/admin/validate_login",
  [
    check("email", "Email is required").notEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password is required").notEmpty(),
  ],
  adminExtraSecurity
);

router.put(
  "/admin/extra_password/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  [
    check("password", "Password is required").notEmpty(),
    check("password", "Password must be at least 8 characters").isLength({
      min: 8,
    }),
  ],
  updateAdminExtraPassword
);

router.get(
  "/admins/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getAdmins
);

router.put(
  "/admin/lock_admin_area/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  lockAdminArea
);

router.put(
  "/admin/unlock_admin_area/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  unlockAdminArea
);

router.post(
  "/admin/create/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  [
    check("firstName", "First name is required").notEmpty(),
    check("lastName", "Last name is required").notEmpty(),
    check("email", "Email is required").notEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password is required").notEmpty(),
    check("password", "Password must be at least 8 characters").isLength({
      min: 8,
    }),
    check("extraPassword", "Extra password is required").notEmpty(),
    check(
      "extraPassword",
      "Extra password must be at least 8 characters"
    ).isLength({ min: 8 }),
  ],
  createAdmin
);

router.delete(
  "/admin/:adminId/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  deleteAdmin
);

router.get(
  "/admin/admin_area_status/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getAdminAreaCurrentStatus
);

router.get(
  "/admin/users_total_count/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getTotalUsersNumber
);

router.get(
  "/admin/users/:userId",
  requireSignIn,
  isAuthenticated,
  isAdmin,
  getUsers
);

router.param("userId", userById);

export default router;
