import express from 'express';
import { getNotifications, markAsRead, markAllRead, createNotification } from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllRead);
router.post('/', admin, createNotification);

export default router;
