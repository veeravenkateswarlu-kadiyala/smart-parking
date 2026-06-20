import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiNavigation, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import { TRAFFIC_COLORS, DENSITY_LABELS } from '../utils/helpers';
import { trafficAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

const TrafficDashboard = () => {
  const [data, setData] = useState(null);
  const { trafficData } = useSocket();

  useEffect(() => { loadTraffic(); }, []);

  useEffect(() => {
    if (trafficData && data) {
      setData((prev) => ({
        ...prev,
        roads: prev.roads.map((r) => r.roadId === trafficData.roadId ? trafficData : r),
      }));
    }
  }, [trafficData]);

  const loadTraffic = async () => {
    try {
      const { data: res } = await trafficAPI.getAll();
      setData(res);
    } catch {
      setData({ roads: [], summary: {} });
    }
  };

  const chartData = (data?.roads || []).map((r) => ({
    name: r.roadName.split(' ')[0],
    vehicles: r.vehicleCount,
    speed: r.averageSpeed,
  }));

  return (
    <Layout title="Traffic Dashboard" subtitle="Live traffic density and road status">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Vehicles" value={data?.summary?.totalVehicles || 0} icon={FiActivity} color="primary" />
        <StatCard title="Avg Speed" value={`${data?.summary?.averageSpeed || 0} km/h`} icon={FiTrendingUp} color="green" />
        <StatCard title="Active Alerts" value={data?.summary?.activeAlerts || 0} icon={FiAlertTriangle} color="red" />
        <StatCard title="Heavy Traffic" value={data?.summary?.heavy || 0} icon={FiNavigation} color="yellow" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Vehicle Count by Road</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="vehicles" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Road Status</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {(data?.roads || []).map((road) => (
              <motion.div key={road.roadId} layout className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{road.roadName}</p>
                    <p className="text-xs text-slate-400 mt-1">{road.vehicleCount} vehicles • {road.averageSpeed} km/h • Entry: {road.entryCount || 0} Exit: {road.exitCount || 0}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${TRAFFIC_COLORS[road.status]}`}>
                    {DENSITY_LABELS[road.density]}
                  </span>
                </div>
                {road.alerts?.filter((a) => a.active).map((alert, i) => (
                  <div key={i} className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                    <FiAlertTriangle /> {alert.message}
                  </div>
                ))}
                {road.alternateRoutes?.length > 0 && (
                  <div className="mt-2 text-xs text-slate-400">
                    Alt routes: {road.alternateRoutes.map((r) => r.name).join(', ')}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-semibold mb-4">Traffic Features</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Congestion Detection', 'Alternate Routes', 'Emergency Priority', 'Signal Optimization', 'Accident Alerts', 'Construction Zones', 'Blocked Roads', 'Diversion Suggestions'].map((f) => (
            <div key={f} className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent/5 border border-white/5 text-sm">
              <span className="text-accent mr-2">●</span>{f}
            </div>
          ))}
        </div>
      </GlassCard>
    </Layout>
  );
};

export default TrafficDashboard;
