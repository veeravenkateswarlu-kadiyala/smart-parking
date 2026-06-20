import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ParkingSlot from '../models/ParkingSlot.js';
import TrafficData from '../models/TrafficData.js';
import HeatMap from '../models/HeatMap.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import Analytics from '../models/Analytics.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_parking');
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany(), ParkingSlot.deleteMany(), TrafficData.deleteMany(),
      HeatMap.deleteMany(), Vehicle.deleteMany(), Booking.deleteMany(),
      Payment.deleteMany(), Notification.deleteMany(), Analytics.deleteMany(),
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartparking.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      phone: '+91 9876543210',
    });

    const user = await User.create({
      name: 'John Doe',
      email: 'user@smartparking.com',
      password: 'user123',
      isVerified: true,
      phone: '+91 9876543211',
    });

    const zones = ['A', 'B', 'C', 'D'];
    const statuses = ['available', 'available', 'available', 'occupied', 'reserved', 'maintenance'];
    const types = ['standard', 'compact', 'ev', 'disabled', 'premium'];
    const slots = [];

    for (let z = 0; z < zones.length; z++) {
      for (let i = 1; i <= 12; i++) {
        slots.push({
          slotId: `${zones[z]}${String(i).padStart(2, '0')}`,
          zone: zones[z],
          floor: Math.ceil(i / 6),
          row: Math.ceil(i / 4),
          column: ((i - 1) % 4) + 1,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          type: types[Math.floor(Math.random() * types.length)],
          pricePerHour: 100,
          location: {
            lat: 28.6139 + (Math.random() - 0.5) * 0.02,
            lng: 77.209 + (Math.random() - 0.5) * 0.02,
          },
          isEVCharging: types[Math.floor(Math.random() * types.length)] === 'ev',
        });
      }
    }
    await ParkingSlot.insertMany(slots);

    const roads = [
      { roadId: 'R001', roadName: 'Ring Road North', zone: 'north', density: 'medium', vehicleCount: 120, averageSpeed: 35, status: 'yellow', location: { lat: 28.62, lng: 77.21 } },
      { roadId: 'R002', roadName: 'MG Road', zone: 'central', density: 'heavy', vehicleCount: 250, averageSpeed: 15, status: 'red', location: { lat: 28.61, lng: 77.20 }, alerts: [{ type: 'construction', message: 'Road work in progress', active: true }] },
      { roadId: 'R003', roadName: 'Outer Ring Road', zone: 'east', density: 'low', vehicleCount: 60, averageSpeed: 55, status: 'green', location: { lat: 28.63, lng: 77.22 } },
      { roadId: 'R004', roadName: 'Airport Expressway', zone: 'west', density: 'medium', vehicleCount: 150, averageSpeed: 40, status: 'yellow', location: { lat: 28.60, lng: 77.19 } },
      { roadId: 'R005', roadName: 'City Center Blvd', zone: 'central', density: 'heavy', vehicleCount: 300, averageSpeed: 12, status: 'red', location: { lat: 28.615, lng: 77.205 }, alerts: [{ type: 'accident', message: 'Minor accident near junction', active: true }] },
      { roadId: 'R006', roadName: 'Tech Park Road', zone: 'south', density: 'low', vehicleCount: 45, averageSpeed: 60, status: 'green', location: { lat: 28.605, lng: 77.215 } },
    ];
    await TrafficData.insertMany(roads);

    for (const zone of zones) {
      for (let i = 0; i < 5; i++) {
        await HeatMap.create({
          zone,
          type: ['occupancy', 'traffic', 'revenue', 'movement'][i % 4],
          intensity: Math.floor(Math.random() * 100),
          location: {
            lat: 28.6139 + (Math.random() - 0.5) * 0.03,
            lng: 77.209 + (Math.random() - 0.5) * 0.03,
          },
          hour: Math.floor(Math.random() * 24),
          data: {
            occupiedSlots: Math.floor(Math.random() * 10),
            totalSlots: 12,
            revenue: Math.floor(Math.random() * 5000),
            vehicleCount: Math.floor(Math.random() * 100),
          },
        });
      }
    }

    await Vehicle.create([
      { user: user._id, vehicleNumber: 'DL01AB1234', vehicleType: 'car', brand: 'Toyota', model: 'Camry', color: 'White', isDefault: true },
      { user: user._id, vehicleNumber: 'DL02EV5678', vehicleType: 'ev', brand: 'Tesla', model: 'Model 3', color: 'Blue', isEV: true },
    ]);

    await Analytics.create({
      date: new Date(),
      type: 'daily',
      metrics: {
        totalBookings: 156,
        totalRevenue: 45600,
        occupancyRate: 68,
        averageDuration: 3,
        peakHour: '18:00',
        popularZone: 'A',
        trafficDensity: 45,
        vehicleTypes: { car: 45, suv: 20, bike: 15, ev: 10, truck: 10 },
        hourlyBookings: [2, 1, 0, 0, 1, 3, 8, 15, 20, 18, 12, 10, 14, 16, 12, 10, 15, 22, 25, 18, 12, 8, 5, 3],
      },
    });

    console.log('Seed data created successfully!');
    console.log('Admin: admin@smartparking.com / admin123');
    console.log('User: user@smartparking.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
