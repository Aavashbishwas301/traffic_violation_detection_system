import express from "express";
import {
  getSystemStats,
  getUsers,
  deleteUser,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getRules,
  updateRule,
  generateGlobalReport,
  broadcastMessage,
  getNotifications,
  getComplaints,
  respondToComplaint,
  getDetailedReports,
  updateOfficer,
  createComplaint,
  getUnregisteredVehicles,
  assignVehicleOwner,
} from "../controllers/adminController.js";
import { updateViolation } from "../controllers/violationController.js";
import { protect, admin, police } from "../middleware/authMiddleware.js";
import {
  broadcastValidation,
  ruleValidation,
  complaintValidation,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get("/stats", protect, police, getSystemStats);
router.put("/violations/:id", protect, police, updateViolation);

// Admin-only management routes
router.route("/users").get(protect, admin, getUsers);
router.route("/users/:id").delete(protect, admin, deleteUser);
router.route("/vehicles").get(protect, admin, getVehicles).post(protect, admin, createVehicle);
router
  .route("/vehicles/unregistered")
  .get(protect, admin, getUnregisteredVehicles);
router.route("/vehicles/:id").put(protect, admin, updateVehicle).delete(protect, admin, deleteVehicle);
router
  .route("/vehicles/:id/assign-owner")
  .put(protect, admin, assignVehicleOwner);

// Rules and Reports
router.get("/rules", protect, police, getRules);
router.post("/rules", protect, admin, ruleValidation, updateRule);
router.get("/report", protect, admin, generateGlobalReport);
router.post(
  "/broadcast",
  protect,
  admin,
  broadcastValidation,
  broadcastMessage,
);
router.get("/notifications", protect, getNotifications);

// Complaints Management
router.get("/complaints", protect, admin, getComplaints);
router.post("/complaints", protect, complaintValidation, createComplaint);
router.put("/complaints/:id", protect, admin, respondToComplaint);

// Officer Management
router.put("/officers/:id", protect, admin, updateOfficer);

// Detailed Reports
router.get("/reports/:period", protect, admin, getDetailedReports);

export default router;
