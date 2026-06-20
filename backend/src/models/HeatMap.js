import mongoose from 'mongoose';

const heatMapSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true },
    type: {
      type: String,
      enum: ['occupancy', 'traffic', 'revenue', 'movement'],
      default: 'occupancy',
    },
    intensity: { type: Number, default: 0, min: 0, max: 100 },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    hour: { type: Number, min: 0, max: 23 },
    data: {
      occupiedSlots: Number,
      totalSlots: Number,
      revenue: Number,
      vehicleCount: Number,
      peakHour: String,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('HeatMap', heatMapSchema);
