import mongoose from 'mongoose';

const trafficDataSchema = new mongoose.Schema(
  {
    roadId: { type: String, required: true },
    roadName: { type: String, required: true },
    zone: { type: String, default: 'central' },
    density: { type: String, enum: ['low', 'medium', 'heavy'], default: 'low' },
    vehicleCount: { type: Number, default: 0 },
    averageSpeed: { type: Number, default: 60 },
    status: { type: String, enum: ['green', 'yellow', 'red'], default: 'green' },
    congestionLevel: { type: Number, default: 0, min: 0, max: 100 },
    location: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 },
    },
    alerts: [
      {
        type: { type: String, enum: ['accident', 'construction', 'blocked', 'diversion', 'emergency'] },
        message: String,
        active: { type: Boolean, default: true },
      },
    ],
    alternateRoutes: [{ name: String, eta: Number, distance: Number }],
    signalTiming: { type: Number, default: 60 },
    entryCount: { type: Number, default: 0 },
    exitCount: { type: Number, default: 0 },
    prediction: {
      nextHourDensity: String,
      peakHour: String,
      recommendedRoute: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('TrafficData', trafficDataSchema);
