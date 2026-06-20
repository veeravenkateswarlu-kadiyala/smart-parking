import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    metrics: {
      totalBookings: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      occupancyRate: { type: Number, default: 0 },
      averageDuration: { type: Number, default: 0 },
      peakHour: { type: String, default: '10:00' },
      popularZone: { type: String, default: 'A' },
      trafficDensity: { type: Number, default: 0 },
      vehicleTypes: {
        car: { type: Number, default: 0 },
        suv: { type: Number, default: 0 },
        bike: { type: Number, default: 0 },
        ev: { type: Number, default: 0 },
        truck: { type: Number, default: 0 },
      },
      hourlyBookings: [Number],
      zoneBookings: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Analytics', analyticsSchema);
