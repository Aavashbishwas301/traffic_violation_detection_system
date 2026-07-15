import express from "express";
import {
  getVehicleByNumber,
  getMyVehicles,
  registerVehicle,
} from "../controllers/vehicleController.js";
import { protect, police } from "../middleware/authMiddleware.js";
import { vehicleRegistrationValidation } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.route("/").post(protect, vehicleRegistrationValidation, registerVehicle);
router.get("/my", protect, getMyVehicles);
router.get("/:number", protect, police, getVehicleByNumber);

export default router;
