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
  getNotifications
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
router.route('/rules').get(protect, admin, getRules).post(protect, admin, updateRule);
router.get('/report', protect, admin, generateGlobalReport);
router.post('/broadcast', protect, admin, broadcastMessage);
router.get('/notifications', protect, getNotifications);

export default router;
