import express from 'express';
import {
  getAdminDashboard,
  getPendingTrees,
  approveTree,
  rejectTree,
  getAllTrees,
  getUsers,
  toggleUserStatus,
  getAnalytics,
  getReports,
  getAdminSpecies,
  createSpecies,
  updateSpecies,
  deleteSpecies,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Apply administrative guards to all sub-routes
router.use(protect, admin);

router.get('/dashboard', getAdminDashboard);
router.get('/trees/pending', getPendingTrees);
router.put('/trees/:id/approve', approveTree);
router.put('/trees/:id/reject', rejectTree);
router.get('/trees', getAllTrees);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/analytics', getAnalytics);
router.get('/reports', getReports);

// Tree Species Management routes
router.get('/species', getAdminSpecies);
router.post('/species', createSpecies);
router.put('/species/:id', updateSpecies);
router.delete('/species/:id', deleteSpecies);

export default router;
