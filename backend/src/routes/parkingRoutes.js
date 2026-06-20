import express from 'express';
import {
  getAllSlots, getSlotById, getSlotStats, createBooking, getBookings,
  cancelBooking, checkIn, checkOut, scanQR, getDashboard, createSlot,
  updateSlot, deleteSlot, search, getRecommendations,
} from '../controllers/parkingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/slots', getAllSlots);
router.get('/slots/stats', getSlotStats);
router.get('/slots/:id', getSlotById);
router.get('/dashboard', protect, getDashboard);
router.get('/bookings', protect, getBookings);
router.post('/bookings', protect, createBooking);
router.put('/bookings/:id/cancel', protect, cancelBooking);
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.post('/scan-qr', protect, scanQR);
router.get('/search', protect, search);
router.get('/recommendations', protect, getRecommendations);
router.post('/slots', protect, admin, createSlot);
router.put('/slots/:id', protect, admin, updateSlot);
router.delete('/slots/:id', protect, admin, deleteSlot);

export default router;
