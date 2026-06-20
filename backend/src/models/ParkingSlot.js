import mongoose from 'mongoose';

const parkingSlotSchema = new mongoose.Schema(
  {
    slotId: { type: String, required: true, unique: true },
    zone: { type: String, required: true },
    floor: { type: Number, default: 1 },
    row: { type: Number, default: 1 },
    column: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
    type: {
      type: String,
      enum: ['standard', 'compact', 'ev', 'disabled', 'premium'],
      default: 'standard',
    },
    pricePerHour: { type: Number, default: 100 },
    location: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 },
    },
    currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    lastUpdated: { type: Date, default: Date.now },
    sensorId: String,
    isEVCharging: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ParkingSlot', parkingSlotSchema);
