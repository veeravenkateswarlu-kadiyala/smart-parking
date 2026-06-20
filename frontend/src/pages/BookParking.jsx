import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiMapPin, FiCheck } from 'react-icons/fi';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { SlotBadge, formatCurrency, calculatePrice } from '../utils/helpers';
import { parkingAPI, vehicleAPI, paymentAPI } from '../services/api';

const BookParking = () => {
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    duration: 2,
    vehicleId: '',
    vehicleNumber: '',
  });
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [slotsRes, vehiclesRes] = await Promise.all([
        parkingAPI.getSlots({ status: 'available' }),
        vehicleAPI.getAll(),
      ]);
      setSlots(slotsRes.data.slots || []);
      setVehicles(vehiclesRes.data.vehicles || []);
    } catch {
      setSlots([]);
    }
  };

  const price = calculatePrice(form.duration);

  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Select a slot');
    setLoading(true);
    try {
      const { data } = await parkingAPI.createBooking({
        slotId: selectedSlot._id,
        ...form,
      });
      setBooking(data.booking);
      setStep(3);
      toast.success('Booking created! Complete payment to confirm.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: payData } = await paymentAPI.create({ bookingId: booking._id });
      await paymentAPI.verify({ paymentId: payData.payment._id, razorpayPaymentId: `pay_demo_${Date.now()}` });
      toast.success('Payment successful!');
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Book Parking" subtitle="Reserve your spot in seconds">
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-primary-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= s ? 'border-primary-500 bg-primary-500/20' : 'border-slate-600'}`}>
              {step > s ? <FiCheck /> : s}
            </div>
            <span className="text-sm hidden sm:inline">{['Select Slot', 'Details', 'Confirm', 'Done'][s - 1]}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slots.map((slot, i) => (
            <motion.button
              key={slot._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => { setSelectedSlot(slot); setStep(2); }}
              className={`glass p-5 text-left hover:bg-white/[0.07] transition-all ${selectedSlot?._id === slot._id ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-display font-bold text-lg">{slot.slotId}</span>
                <SlotBadge status={slot.status} />
              </div>
              <p className="text-sm text-slate-400">Zone {slot.zone} • Floor {slot.floor}</p>
              <p className="text-sm text-slate-400 capitalize">{slot.type} • {formatCurrency(slot.pricePerHour)}/hr</p>
              {slot.isEVCharging && <span className="text-xs text-accent mt-2 inline-block">⚡ EV Charging</span>}
            </motion.button>
          ))}
          {slots.length === 0 && <p className="text-slate-400 col-span-full text-center py-12">No available slots. Check back later.</p>}
        </div>
      )}

      {step === 2 && selectedSlot && (
        <GlassCard className="max-w-lg mx-auto">
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Slot {selectedSlot.slotId}</h3>
            <p className="text-slate-400">Zone {selectedSlot.zone} • {selectedSlot.type}</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 flex items-center gap-2 mb-2"><FiCalendar /> Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="text-sm text-slate-400 flex items-center gap-2 mb-2"><FiClock /> Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Duration (hours, max 24)</label>
              <input type="range" min="1" max="24" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} className="w-full accent-primary-500" />
              <div className="flex justify-between text-sm mt-1">
                <span>{form.duration} hour{form.duration > 1 ? 's' : ''}</span>
                <span className="font-bold text-accent">{formatCurrency(price)}</span>
              </div>
            </div>
            {vehicles.length > 0 && (
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Vehicle</label>
                <select value={form.vehicleId} onChange={(e) => {
                  const v = vehicles.find((v) => v._id === e.target.value);
                  setForm({ ...form, vehicleId: e.target.value, vehicleNumber: v?.vehicleNumber || '' });
                }} className="input-field">
                  <option value="">Select vehicle</option>
                  {vehicles.map((v) => <option key={v._id} value={v._id}>{v.vehicleNumber} - {v.vehicleType}</option>)}
                </select>
              </div>
            )}
            <input type="text" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} className="input-field" placeholder="Vehicle Number" />
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button onClick={handleBook} disabled={loading} className="btn-primary flex-1">{loading ? 'Booking...' : 'Confirm Booking'}</button>
          </div>
        </GlassCard>
      )}

      {step === 3 && booking && (
        <GlassCard className="max-w-md mx-auto text-center">
          <FiMapPin className="mx-auto text-4xl text-accent mb-4" />
          <h3 className="text-xl font-semibold mb-2">Booking Created</h3>
          <p className="text-slate-400 mb-4">ID: {booking.bookingId}</p>
          <div className="p-4 rounded-xl bg-white/5 mb-4 text-left space-y-2 text-sm">
            <p>Slot: <strong>{selectedSlot?.slotId}</strong></p>
            <p>Date: <strong>{form.date}</strong> at <strong>{form.startTime}</strong></p>
            <p>Duration: <strong>{form.duration}h</strong></p>
            <p>Amount: <strong className="text-accent">{formatCurrency(booking.amount)}</strong></p>
          </div>
          <button onClick={handlePayment} disabled={loading} className="btn-primary w-full">
            {loading ? 'Processing...' : `Pay ${formatCurrency(booking.amount)}`}
          </button>
        </GlassCard>
      )}

      {step === 4 && booking && (
        <GlassCard className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-3xl text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
          <p className="text-slate-400 mb-6">Scan this QR code at entry</p>
          <div className="bg-white p-4 rounded-xl inline-block mb-4">
            <QRCodeSVG value={JSON.stringify({ bookingId: booking.bookingId, slotId: selectedSlot?.slotId })} size={180} />
          </div>
          <p className="text-sm text-slate-400">Booking ID: {booking.bookingId}</p>
        </GlassCard>
      )}
    </Layout>
  );
};

export default BookParking;
