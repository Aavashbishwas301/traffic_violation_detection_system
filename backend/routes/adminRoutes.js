import express from 'express';
import { 
  getSystemStats, 
  getUsers, 
  deleteUser, 
  getVehicles, 
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
  createComplaint
} from '../controllers/adminController.js';
import { updateViolation } from '../controllers/violationController.js';
import { protect, admin, police } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, police, getSystemStats);
router.put('/violations/:id', protect, police, updateViolation);

// Admin-only management routes
router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);
router.route('/vehicles').get(protect, admin, getVehicles);
router.route('/vehicles/:id').delete(protect, admin, deleteVehicle);

// Rules and Reports
router.get('/rules', protect, police, getRules);
router.post('/rules', protect, admin, updateRule);
router.get('/report', protect, admin, generateGlobalReport);
router.post('/broadcast', protect, admin, broadcastMessage);
router.get('/notifications', protect, getNotifications);

// Complaints Management
router.get('/complaints', protect, admin, getComplaints);
router.post('/complaints', protect, createComplaint); // Owners can create
router.put('/complaints/:id', protect, admin, respondToComplaint);

// Officer Management
router.put('/officers/:id', protect, admin, updateOfficer);

// Detailed Reports
router.get('/reports/:period', protect, admin, getDetailedReports);

export default router;
