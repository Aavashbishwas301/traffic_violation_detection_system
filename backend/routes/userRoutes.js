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

const router = express.Router();

router.post("/", registerValidation, registerUser);
router.post("/login", loginValidation, authUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
