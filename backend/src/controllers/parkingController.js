import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';
import { generateQRCode, calculatePrice } from '../utils/helpers.js';
import Notification from '../models/Notification.js';

const createNotification = async (userId, type, title, message, io) => {
  const notification = await Notification.create({ user: userId, type, title, message });
  if (io) io.to(`user_${userId}`).emit('notification', notification);
  return notification;
};

export const getAllSlots = async (req, res) => {
  try {
    const { zone, status, type } = req.query;
    const filter = {};
    if (zone) filter.zone = zone;
    if (status) filter.status = status;
    if (type) filter.type = type;
    const slots = await ParkingSlot.find(filter).populate('currentBooking');
    res.json({ success: true, count: slots.length, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSlotById = async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({ slotId: req.params.id }).populate('currentBooking');
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSlotStats = async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    const stats = {
      total: slots.length,
      available: slots.filter((s) => s.status === 'available').length,
      occupied: slots.filter((s) => s.status === 'occupied').length,
      reserved: slots.filter((s) => s.status === 'reserved').length,
      maintenance: slots.filter((s) => s.status === 'maintenance').length,
    };
    stats.occupancyRate = stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0;
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { slotId, date, startTime, duration, vehicleId, vehicleNumber } = req.body;
    if (duration < 1 || duration > 24) {
      return res.status(400).json({ success: false, message: 'Duration must be 1-24 hours' });
    }

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Slot is not available' });
    }

    const amount = calculatePrice(duration);
    const bookingId = `BK${Date.now().toString(36).toUpperCase()}`;
    const [startH, startM] = startTime.split(':').map(Number);
    const endH = (startH + duration) % 24;
    const endTime = `${String(endH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

    const expiresAt = new Date(date);
    expiresAt.setHours(startH, startM + 15, 0, 0);

    const qrData = { bookingId, slotId: slot.slotId, userId: req.user._id };
    const qrCode = await generateQRCode(qrData);

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      slot: slot._id,
      vehicle: vehicleId,
      vehicleNumber,
      date,
      startTime,
      endTime,
      duration,
      amount,
      qrCode,
      expiresAt,
      status: 'confirmed',
    });

    slot.status = 'reserved';
    slot.currentBooking = booking._id;
    await slot.save();

    const io = req.app.get('io');
    io.emit('slotUpdate', { slotId: slot.slotId, status: 'reserved', slot });
    io.emit('dashboardUpdate', await getDashboardData());

    await createNotification(
      req.user._id,
      'booking_success',
      'Booking Confirmed',
      `Your booking ${bookingId} for slot ${slot.slotId} is confirmed.`,
      io
    );

    res.status(201).json({ success: true, booking, qrCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const bookings = await Booking.find(filter)
      .populate('slot')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('slot');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const slot = await ParkingSlot.findById(booking.slot._id);
    if (slot) {
      slot.status = 'available';
      slot.currentBooking = null;
      await slot.save();
    }

    const io = req.app.get('io');
    io.emit('slotUpdate', { slotId: slot?.slotId, status: 'available' });
    await createNotification(booking.user, 'booking_cancelled', 'Booking Cancelled', `Booking ${booking.bookingId} has been cancelled.`, io);

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ bookingId }).populate('slot');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = 'active';
    booking.checkInTime = new Date();
    await booking.save();

    const slot = await ParkingSlot.findById(booking.slot._id);
    slot.status = 'occupied';
    await slot.save();

    const io = req.app.get('io');
    io.emit('slotUpdate', { slotId: slot.slotId, status: 'occupied' });

    res.json({ success: true, message: 'Check-in successful', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ bookingId }).populate('slot');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = 'completed';
    booking.checkOutTime = new Date();
    await booking.save();

    const slot = await ParkingSlot.findById(booking.slot._id);
    slot.status = 'available';
    slot.currentBooking = null;
    await slot.save();

    const io = req.app.get('io');
    io.emit('slotUpdate', { slotId: slot.slotId, status: 'available' });

    res.json({ success: true, message: 'Check-out successful', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scanQR = async (req, res) => {
  try {
    const data = JSON.parse(req.body.qrData);
    const booking = await Booking.findOne({ bookingId: data.bookingId }).populate('slot');
    if (!booking) return res.status(404).json({ success: false, message: 'Invalid QR code' });

    if (booking.status === 'confirmed') {
      return checkIn({ ...req, body: { bookingId: data.bookingId } }, res);
    }
    if (booking.status === 'active') {
      return checkOut({ ...req, body: { bookingId: data.bookingId } }, res);
    }
    res.status(400).json({ success: false, message: 'Booking cannot be processed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function getDashboardData() {
  const slots = await ParkingSlot.find();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayBookings = await Booking.find({ createdAt: { $gte: todayStart }, paymentStatus: 'paid' });
  const activeBookings = await Booking.countDocuments({ status: { $in: ['confirmed', 'active'] } });

  return {
    total: slots.length,
    available: slots.filter((s) => s.status === 'available').length,
    occupied: slots.filter((s) => s.status === 'occupied').length,
    reserved: slots.filter((s) => s.status === 'reserved').length,
    maintenance: slots.filter((s) => s.status === 'maintenance').length,
    revenueToday: todayBookings.reduce((sum, b) => sum + b.amount, 0),
    activeBookings,
  };
}

export const getDashboard = async (req, res) => {
  try {
    const data = await getDashboardData();
    res.json({ success: true, dashboard: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.create(req.body);
    const io = req.app.get('io');
    io.emit('slotUpdate', { slotId: slot.slotId, status: slot.status, slot });
    res.status(201).json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const io = req.app.get('io');
    io.emit('slotUpdate', { slotId: slot.slotId, status: slot.status, slot });
    res.json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSlot = async (req, res) => {
  try {
    await ParkingSlot.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

    const [slots, bookings, users] = await Promise.all([
      ParkingSlot.find({ slotId: { $regex: q, $options: 'i' } }),
      Booking.find({ bookingId: { $regex: q, $options: 'i' } }).populate('slot user', 'name email slotId'),
      (await import('../models/User.js')).default.find({ name: { $regex: q, $options: 'i' } }).select('name email'),
    ]);

    const vehicles = await (await import('../models/Vehicle.js')).default
      .find({ vehicleNumber: { $regex: q, $options: 'i' } })
      .populate('user', 'name');

    res.json({ success: true, results: { slots, bookings, users, vehicles } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ status: 'available' });
    const zones = {};
    slots.forEach((s) => {
      if (!zones[s.zone]) zones[s.zone] = [];
      zones[s.zone].push(s);
    });

    const recommendations = {
      nearest: slots.slice(0, 3),
      cheapest: [...slots].sort((a, b) => a.pricePerHour - b.pricePerHour).slice(0, 3),
      leastCrowded: Object.entries(zones)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([zone, zoneSlots]) => ({ zone, available: zoneSlots.length, slots: zoneSlots.slice(0, 2) })),
      bestArrivalTime: '10:00 AM - Low traffic period',
      bestRoute: 'Via Ring Road - Fastest route with moderate traffic',
    };

    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
