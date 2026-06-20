import express from 'express';
import {
  getAnalytics, getAdminStats, getAllUsers, exportReport, getPredictions,
} from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/predictions', protect, getPredictions);
router.get('/', protect, getAnalytics);
router.get('/admin/stats', protect, admin, getAdminStats);
router.get('/admin/users', protect, admin, getAllUsers);
router.get('/export', protect, admin, exportReport);

export default router;
