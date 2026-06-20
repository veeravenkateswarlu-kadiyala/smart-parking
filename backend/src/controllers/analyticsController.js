import Analytics from '../models/Analytics.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import ParkingSlot from '../models/ParkingSlot.js';
import User from '../models/User.js';
import ExcelJS from 'exceljs';

export const getAnalytics = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    let analytics = await Analytics.findOne({ type: period }).sort({ date: -1 });

    if (!analytics) {
      analytics = await generateAnalytics(period);
    }

    const bookings = await Booking.find().populate('slot');
    const hourlyBookings = Array(24).fill(0);
    bookings.forEach((b) => {
      const hour = parseInt(b.startTime?.split(':')[0] || 0);
      hourlyBookings[hour]++;
    });

    const zoneBookings = {};
    bookings.forEach((b) => {
      const zone = b.slot?.zone || 'Unknown';
      zoneBookings[zone] = (zoneBookings[zone] || 0) + 1;
    });

    res.json({
      success: true,
      analytics: analytics?.metrics || {},
      charts: {
        hourlyBookings,
        zoneBookings,
        dailyRevenue: await getDailyRevenue(),
        weeklyBookings: await getWeeklyBookings(),
        occupancyTrend: await getOccupancyTrend(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function generateAnalytics(type) {
  const bookings = await Booking.find();
  const payments = await Payment.find({ status: 'success' });
  const slots = await ParkingSlot.find();

  return Analytics.create({
    date: new Date(),
    type,
    metrics: {
      totalBookings: bookings.length,
      totalRevenue: payments.reduce((s, p) => s + p.amount, 0),
      occupancyRate: slots.length ? Math.round((slots.filter((s) => s.status === 'occupied').length / slots.length) * 100) : 0,
      averageDuration: bookings.length ? Math.round(bookings.reduce((s, b) => s + b.duration, 0) / bookings.length) : 0,
      peakHour: '18:00',
      popularZone: 'A',
      trafficDensity: 45,
      vehicleTypes: { car: 45, suv: 20, bike: 15, ev: 10, truck: 10 },
    },
  });
}

async function getDailyRevenue() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const payments = await Payment.find({ status: 'success', createdAt: { $gte: date, $lt: nextDay } });
    days.push({
      date: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      revenue: payments.reduce((s, p) => s + p.amount, 0),
    });
  }
  return days;
}

async function getWeeklyBookings() {
  const weeks = [];
  for (let i = 3; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - (i + 1) * 7);
    const end = new Date();
    end.setDate(end.getDate() - i * 7);
    const count = await Booking.countDocuments({ createdAt: { $gte: start, $lt: end } });
    weeks.push({ week: `Week ${4 - i}`, bookings: count });
  }
  return weeks;
}

async function getOccupancyTrend() {
  const hours = [];
  for (let i = 0; i < 24; i += 3) {
    hours.push({ hour: `${String(i).padStart(2, '0')}:00`, occupancy: Math.round(30 + Math.random() * 50) });
  }
  return hours;
}

export const getAdminStats = async (req, res) => {
  try {
    const [users, slots, bookings, payments, revenue] = await Promise.all([
      User.countDocuments(),
      ParkingSlot.find(),
      Booking.countDocuments(),
      Payment.countDocuments({ status: 'success' }),
      Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers: users,
        totalSlots: slots.length,
        availableSlots: slots.filter((s) => s.status === 'available').length,
        totalBookings: bookings,
        totalPayments: payments,
        totalRevenue: revenue[0]?.total || 0,
        pendingBookings: await Booking.countDocuments({ status: 'pending' }),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const bookings = await Booking.find().populate('user slot', 'name email slotId zone');

    if (format === 'csv') {
      const csv = ['Booking ID,User,Slot,Date,Duration,Amount,Status']
        .concat(
          bookings.map(
            (b) =>
              `${b.bookingId},${b.user?.name || ''},${b.slot?.slotId || ''},${new Date(b.date).toLocaleDateString()},${b.duration},${b.amount},${b.status}`
          )
        )
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Bookings');
      sheet.columns = [
        { header: 'Booking ID', key: 'bookingId', width: 15 },
        { header: 'User', key: 'user', width: 20 },
        { header: 'Slot', key: 'slot', width: 10 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Duration', key: 'duration', width: 10 },
        { header: 'Amount', key: 'amount', width: 10 },
        { header: 'Status', key: 'status', width: 12 },
      ];
      bookings.forEach((b) =>
        sheet.addRow({
          bookingId: b.bookingId,
          user: b.user?.name,
          slot: b.slot?.slotId,
          date: new Date(b.date).toLocaleDateString(),
          duration: b.duration,
          amount: b.amount,
          status: b.status,
        })
      );
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.xlsx');
      await workbook.xlsx.write(res);
      return;
    }

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPredictions = async (req, res) => {
  try {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    try {
      const response = await fetch(`${aiUrl}/predict`);
      const data = await response.json();
      return res.json({ success: true, predictions: data });
    } catch {
      const mockPredictions = {
        expectedOccupancy: 72,
        peakHours: ['09:00', '12:00', '18:00'],
        bestTimeToPark: '10:00 - 11:00',
        lowTrafficPeriods: ['06:00 - 08:00', '14:00 - 16:00'],
        hourlyForecast: Array.from({ length: 24 }, (_, i) => ({
          hour: `${String(i).padStart(2, '0')}:00`,
          occupancy: Math.round(30 + Math.sin(i / 3) * 25 + Math.random() * 15),
        })),
        recommendations: [
          'Park in Zone C for lowest occupancy during peak hours',
          'Arrive before 9 AM to avoid congestion',
          'EV slots available in Zone B',
        ],
      };
      res.json({ success: true, predictions: mockPredictions, source: 'fallback' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
