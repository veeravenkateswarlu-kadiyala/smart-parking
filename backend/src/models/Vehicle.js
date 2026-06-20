import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNumber: { type: String, required: true, uppercase: true },
    vehicleType: {
      type: String,
      enum: ['car', 'suv', 'bike', 'truck', 'ev', 'other'],
      default: 'car',
    },
    brand: { type: String, default: '' },
    model: { type: String, default: '' },
    color: { type: String, default: '' },
    isEV: { type: Boolean, default: false },
    rfidTag: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    history: [
      {
        booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        slot: String,
        checkIn: Date,
        checkOut: Date,
        amount: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
