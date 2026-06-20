import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import TrafficData from '../models/TrafficData.js';
import HeatMap from '../models/HeatMap.js';

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join', (userId) => {
      if (userId) socket.join(`user_${userId}`);
    });

    socket.on('subscribeDashboard', () => {
      socket.join('dashboard');
    });

    socket.on('subscribeTraffic', () => {
      socket.join('traffic');
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Simulate live traffic updates every 10 seconds
  setInterval(async () => {
    try {
      const roads = await TrafficData.find();
      if (roads.length === 0) return;

      const road = roads[Math.floor(Math.random() * roads.length)];
      const densities = ['low', 'medium', 'heavy'];
      const density = densities[Math.floor(Math.random() * densities.length)];
      const statusMap = { low: 'green', medium: 'yellow', heavy: 'red' };

      road.density = density;
      road.status = statusMap[density];
      road.vehicleCount = Math.floor(Math.random() * 200 + 50);
      road.averageSpeed = density === 'heavy' ? 15 : density === 'medium' ? 35 : 55;
      road.congestionLevel = density === 'heavy' ? 85 : density === 'medium' ? 50 : 20;
      await road.save();

      io.to('traffic').emit('trafficUpdate', road);
      io.to('dashboard').emit('trafficUpdate', road);
    } catch (err) {
      // DB may not be connected
    }
  }, 10000);

  // Expire reservations every minute
  setInterval(async () => {
    try {
      const expired = await Booking.find({
        status: 'confirmed',
        expiresAt: { $lt: new Date() },
        checkInTime: { $exists: false },
      }).populate('slot');

      for (const booking of expired) {
        booking.status = 'expired';
        await booking.save();
        if (booking.slot) {
          const slot = await ParkingSlot.findById(booking.slot._id);
          if (slot) {
            slot.status = 'available';
            slot.currentBooking = null;
            await slot.save();
            io.emit('slotUpdate', { slotId: slot.slotId, status: 'available' });
          }
        }
        io.to(`user_${booking.user}`).emit('notification', {
          type: 'reservation_expiry',
          title: 'Reservation Expired',
          message: `Booking ${booking.bookingId} has expired.`,
        });
      }
    } catch (err) {
      // DB may not be connected
    }
  }, 60000);

  // Update heat maps every 15 seconds
  setInterval(async () => {
    try {
      const heatMaps = await HeatMap.find().limit(20);
      heatMaps.forEach((hm) => {
        hm.intensity = Math.min(100, Math.max(0, hm.intensity + (Math.random() * 10 - 5)));
      });
      io.emit('heatMapUpdate', heatMaps);
    } catch (err) {
      // DB may not be connected
    }
  }, 15000);
};
