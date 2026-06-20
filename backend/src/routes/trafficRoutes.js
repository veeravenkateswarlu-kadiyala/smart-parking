import express from 'express';
import {
  getTrafficData, getRoadById, updateTraffic, createTrafficAlert,
  getHeatMaps, getAlternateRoutes,
} from '../controllers/trafficController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTrafficData);
router.get('/heatmap', getHeatMaps);
router.get('/routes', getAlternateRoutes);
router.get('/:id', getRoadById);
router.put('/:id', protect, admin, updateTraffic);
router.post('/:id/alerts', protect, admin, createTrafficAlert);

export default router;
