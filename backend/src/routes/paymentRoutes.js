import express from 'express';
import { createPayment, verifyPayment, getPayments, getInvoice } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/create', createPayment);
router.post('/verify', verifyPayment);
router.get('/', getPayments);
router.get('/:id/invoice', getInvoice);

export default router;
