import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { FiClock, FiX, FiLogIn, FiLogOut } from 'react-icons/fi';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { SlotBadge, formatCurrency } from '../utils/helpers';
import { parkingAPI } from '../services/api';

const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setTimeLeft('Expired'); clearInterval(timer); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return <span className="text-amber-400 font-mono text-sm">{timeLeft}</span>;
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const { data } = await parkingAPI.getBookings();
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    }
  };

  const handleCancel = async (id) => {
    try {
      await parkingAPI.cancelBooking(id);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await parkingAPI.checkIn(bookingId);
      toast.success('Checked in!');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await parkingAPI.checkOut(bookingId);
      toast.success('Checked out!');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    }
  };

  return (
    <Layout title="Booking History" subtitle="Your parking reservations">
      <div className="space-y-4">
        {bookings.map((b, i) => (
          <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard hover={false}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-display font-bold">{b.bookingId}</span>
                    <SlotBadge status={b.status === 'confirmed' ? 'reserved' : b.status === 'active' ? 'occupied' : b.status === 'completed' ? 'available' : 'maintenance'} />
                  </div>
                  <p className="text-sm text-slate-400">Slot: {b.slot?.slotId} • {new Date(b.date).toLocaleDateString()} • {b.startTime} - {b.endTime}</p>
                  <p className="text-sm text-slate-400">Duration: {b.duration}h • {formatCurrency(b.amount)} • Payment: {b.paymentStatus}</p>
                  {b.expiresAt && b.status === 'confirmed' && (
                    <p className="text-sm mt-1 flex items-center gap-2"><FiClock /> Expires in: <CountdownTimer expiresAt={b.expiresAt} /></p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.qrCode && (
                    <button onClick={() => setSelectedQR(b)} className="btn-secondary text-sm py-2 px-4">View QR</button>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => handleCheckIn(b.bookingId)} className="btn-primary text-sm py-2 px-4 flex items-center gap-1"><FiLogIn /> Check In</button>
                  )}
                  {b.status === 'active' && (
                    <button onClick={() => handleCheckOut(b.bookingId)} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"><FiLogOut /> Check Out</button>
                  )}
                  {['confirmed', 'pending'].includes(b.status) && (
                    <button onClick={() => handleCancel(b._id)} className="text-sm py-2 px-4 text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-1"><FiX /> Cancel</button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {bookings.length === 0 && <p className="text-center text-slate-400 py-12">No bookings yet. <a href="/book" className="text-primary-400">Book now</a></p>}
      </div>

      {selectedQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedQR(null)}>
          <div className="glass p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-4">{selectedQR.bookingId}</h3>
            <div className="bg-white p-4 rounded-xl inline-block">
              <QRCodeSVG value={JSON.stringify({ bookingId: selectedQR.bookingId })} size={200} />
            </div>
            <button onClick={() => setSelectedQR(null)} className="btn-secondary mt-4">Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BookingHistory;
