import express from "express";
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  loginValidation,
  registerValidation,
} from "../middleware/validationMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordResetController.js";

const router = express.Router();

router.post("/", registerValidation, registerUser);
router.post("/login", authLimiter, loginValidation, authUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
