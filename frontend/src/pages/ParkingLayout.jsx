import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { getSlotStyle, SlotBadge, formatCurrency } from '../utils/helpers';
import { parkingAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

const ParkingLayout = () => {
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const { slotUpdates } = useSocket();

  useEffect(() => { loadSlots(); }, []);

  useEffect(() => {
    if (slotUpdates) {
      setSlots((prev) => prev.map((s) => s.slotId === slotUpdates.slotId ? { ...s, status: slotUpdates.status, ...slotUpdates.slot } : s));
    }
  }, [slotUpdates]);

  const loadSlots = async () => {
    try {
      const { data } = await parkingAPI.getSlots();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    }
  };

  const zones = [...new Set(slots.map((s) => s.zone))].sort();
  const filtered = filter === 'all' ? slots : slots.filter((s) => s.status === filter);

  return (
    <Layout title="Parking Layout" subtitle="Interactive real-time parking visualization">
      <div className="flex flex-wrap gap-3 mb-6">
        {['all', 'available', 'occupied', 'reserved', 'maintenance'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${filter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'glass hover:bg-white/5'}`}>
            {f === 'all' ? 'All Slots' : f}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-8 text-sm">
        {[{ s: 'available', l: 'Available', c: 'bg-emerald-500' }, { s: 'occupied', l: 'Occupied', c: 'bg-red-500' }, { s: 'reserved', l: 'Reserved', c: 'bg-blue-500' }, { s: 'maintenance', l: 'Maintenance', c: 'bg-amber-500' }].map(({ s, l, c }) => (
          <div key={s} className="flex items-center gap-2"><span className={`w-3 h-3 rounded ${c}`} />{l}</div>
        ))}
      </div>

      {zones.map((zone) => {
        const zoneSlots = filtered.filter((s) => s.zone === zone);
        if (zoneSlots.length === 0) return null;
        return (
          <GlassCard key={zone} className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Zone {zone}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
              {zoneSlots.map((slot) => {
                const style = getSlotStyle(slot.status);
                return (
                  <motion.button
                    key={slot._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(slot)}
                    className={`aspect-square rounded-xl border-2 ${style.border} ${style.bg} flex flex-col items-center justify-center p-2 transition-all hover:shadow-lg`}
                  >
                    <span className={`text-xs font-bold ${style.text}`}>{slot.slotId}</span>
                    <span className={`w-2 h-2 rounded-full mt-1 ${style.dot}`} />
                  </motion.button>
                );
              })}
            </div>
          </GlassCard>
        );
      })}

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black/60 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass p-8 w-full max-w-md">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4"><FiX /></button>
              <h3 className="text-2xl font-display font-bold mb-2">{selected.slotId}</h3>
              <SlotBadge status={selected.status} />
              <div className="mt-4 space-y-2 text-sm">
                <p>Zone: <strong>{selected.zone}</strong></p>
                <p>Floor: <strong>{selected.floor}</strong></p>
                <p>Type: <strong className="capitalize">{selected.type}</strong></p>
                <p>Price: <strong>{formatCurrency(selected.pricePerHour)}/hr</strong></p>
                {selected.isEVCharging && <p className="text-accent">⚡ EV Charging Available</p>}
              </div>
              {selected.status === 'available' && (
                <a href="/book" className="btn-primary w-full mt-6 block text-center">Book This Slot</a>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ParkingLayout;
