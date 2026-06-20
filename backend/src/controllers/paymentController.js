import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import PDFDocument from 'pdfkit';

export const createPayment = async (req, res) => {
  try {
    const { bookingId, method } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const invoiceNumber = `INV-${Date.now()}`;
    const payment = await Payment.create({
      user: req.user._id,
      booking: bookingId,
      amount: booking.amount,
      method: method || 'razorpay',
      status: 'pending',
      invoiceNumber,
      razorpayOrderId: `order_${Date.now()}`,
    });

    res.json({
      success: true,
      payment,
      razorpay: {
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
        orderId: payment.razorpayOrderId,
        amount: booking.amount * 100,
        currency: 'INR',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'success';
    payment.razorpayPaymentId = razorpayPaymentId || `pay_${Date.now()}`;
    payment.transactionId = payment.razorpayPaymentId;
    await payment.save();

    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.paymentId = payment._id;
      await booking.save();
    }

    const io = req.app.get('io');
    await Notification.create({
      user: req.user._id,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Payment of ₹${payment.amount} completed. Invoice: ${payment.invoiceNumber}`,
    });
    io?.to(`user_${req.user._id}`).emit('notification', {
      type: 'payment_success',
      title: 'Payment Successful',
      message: `₹${payment.amount} paid successfully`,
    });

    res.json({ success: true, payment, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const payments = await Payment.find(filter).populate('booking').sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('booking user');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${payment.invoiceNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Smart Parking Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice: ${payment.invoiceNumber}`);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`);
    doc.text(`Amount: ₹${payment.amount}`);
    doc.text(`Status: ${payment.status}`);
    doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
