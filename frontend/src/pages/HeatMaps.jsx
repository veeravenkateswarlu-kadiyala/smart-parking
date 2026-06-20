import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { trafficAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

const HeatMaps = () => {
  const [heatMaps, setHeatMaps] = useState([]);
  const [type, setType] = useState('occupancy');
  const { socket } = useSocket();

  useEffect(() => { loadHeatMaps(); }, [type]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => setHeatMaps(data);
    socket.on('heatMapUpdate', handler);
    return () => socket.off('heatMapUpdate', handler);
  }, [socket]);

  const loadHeatMaps = async () => {
    try {
      const { data } = await trafficAPI.getHeatMaps(type);
      setHeatMaps(data.heatMaps || []);
    } catch {
      setHeatMaps([]);
    }
  };

  const getIntensityColor = (intensity) => {
    if (intensity > 75) return 'from-red-500/80 to-red-600/60';
    if (intensity > 50) return 'from-amber-500/80 to-orange-500/60';
    if (intensity > 25) return 'from-yellow-500/60 to-amber-400/40';
    return 'from-emerald-500/60 to-green-400/40';
  };

  const types = [
    { id: 'occupancy', label: 'Parking Occupancy' },
    { id: 'traffic', label: 'Traffic Congestion' },
    { id: 'revenue', label: 'Revenue by Zone' },
    { id: 'movement', label: 'Vehicle Movement' },
  ];

  return (
    <Layout title="Heat Maps" subtitle="Live visualization of parking and traffic density">
      <div className="flex flex-wrap gap-3 mb-8">
        {types.map((t) => (
          <button key={t.id} onClick={() => setType(t.id)} className={`px-4 py-2 rounded-xl text-sm transition-all ${type === t.id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'glass'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Zone Heat Map</h3>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900/50 border border-white/5">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-2 p-4">
              {heatMaps.slice(0, 12).map((hm, i) => (
                <motion.div
                  key={hm._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl bg-gradient-to-br ${getIntensityColor(hm.intensity)} flex flex-col items-center justify-center border border-white/10`}
                  style={{ opacity: 0.4 + (hm.intensity / 100) * 0.6 }}
                >
                  <span className="text-white font-bold text-sm">{hm.zone}</span>
                  <span className="text-white/80 text-xs">{hm.intensity}%</span>
                </motion.div>
              ))}
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs">
              <span>Low</span>
              <div className="flex h-3 w-32 rounded-full overflow-hidden">
                <div className="flex-1 bg-emerald-500" />
                <div className="flex-1 bg-yellow-500" />
                <div className="flex-1 bg-amber-500" />
                <div className="flex-1 bg-red-500" />
              </div>
              <span>High</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Zone Details</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {heatMaps.map((hm, i) => (
              <div key={hm._id || i} className="p-3 rounded-xl bg-white/5">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Zone {hm.zone}</span>
                  <span className={`text-sm font-bold ${hm.intensity > 70 ? 'text-red-400' : hm.intensity > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {hm.intensity}%
                  </span>
                </div>
                {hm.data && (
                  <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                    {hm.data.occupiedSlots !== undefined && <p>Occupied: {hm.data.occupiedSlots}/{hm.data.totalSlots}</p>}
                    {hm.data.revenue !== undefined && <p>Revenue: ₹{hm.data.revenue}</p>}
                    {hm.data.vehicleCount !== undefined && <p>Vehicles: {hm.data.vehicleCount}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default HeatMaps;
