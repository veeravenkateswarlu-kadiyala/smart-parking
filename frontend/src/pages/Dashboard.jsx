import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiActivity, FiNavigation } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import { parkingAPI, trafficAPI, analyticsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const { dashboardData, trafficData } = useSocket();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (dashboardData) setStats((s) => ({ ...s, ...dashboardData }));
  }, [dashboardData]);

  useEffect(() => {
    if (trafficData) setTraffic((t) => ({ ...t, latestUpdate: trafficData }));
  }, [trafficData]);

  const loadData = async () => {
    try {
      const [dashRes, trafficRes, predRes] = await Promise.all([
        parkingAPI.getDashboard(),
        trafficAPI.getAll(),
        analyticsAPI.getPredictions(),
      ]);
      setStats(dashRes.data.dashboard);
      setTraffic(trafficRes.data);
      setPredictions(predRes.data.predictions);
    } catch {
      setStats({ total: 48, available: 20, occupied: 15, reserved: 10, maintenance: 3, revenueToday: 12500, activeBookings: 8 });
    }
  };

  const occupancyData = predictions?.hourlyForecast?.slice(0, 12) || Array.from({ length: 12 }, (_, i) => ({
    hour: `${String(i + 6).padStart(2, '0')}:00`,
    occupancy: Math.round(30 + Math.random() * 40),
  }));

  return (
    <Layout title="Dashboard" subtitle="Live parking & traffic overview">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Slots" value={stats?.total || 0} icon={FiGrid} color="primary" delay={0} />
        <StatCard title="Available" value={stats?.available || 0} icon={FiCheckCircle} color="green" delay={0.1} />
        <StatCard title="Occupied" value={stats?.occupied || 0} icon={FiXCircle} color="red" delay={0.2} />
        <StatCard title="Reserved" value={stats?.reserved || 0} icon={FiClock} color="blue" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Revenue Today" value={formatCurrency(stats?.revenueToday || 0)} icon={FiDollarSign} color="accent" delay={0.4} />
        <StatCard title="Active Bookings" value={stats?.activeBookings || 0} icon={FiActivity} color="yellow" delay={0.5} />
        <StatCard title="Traffic Alerts" value={traffic?.summary?.activeAlerts || 0} icon={FiNavigation} color="red" delay={0.6} />
        <StatCard title="AI Occupancy" value={`${predictions?.expectedOccupancy || 72}%`} icon={FiActivity} color="primary" trend="up" trendValue="+5%" delay={0.7} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard delay={0.3}>
          <h3 className="text-lg font-semibold mb-4">Occupancy Forecast</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={occupancyData}>
              <defs>
                <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="occupancy" stroke="#3b82f6" fill="url(#colorOcc)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard delay={0.4}>
          <h3 className="text-lg font-semibold mb-4">Live Traffic Overview</h3>
          <div className="space-y-3">
            {(traffic?.roads || []).slice(0, 5).map((road) => (
              <div key={road.roadId} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium text-sm">{road.roadName}</p>
                  <p className="text-xs text-slate-400">{road.vehicleCount} vehicles • {road.averageSpeed} km/h</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  road.status === 'green' ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' :
                  road.status === 'yellow' ? 'text-amber-400 bg-amber-500/20 border-amber-500/30' :
                  'text-red-400 bg-red-500/20 border-red-500/30'
                }`}>
                  {road.density}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {predictions?.recommendations && (
        <GlassCard delay={0.5}>
          <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {predictions.recommendations.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent/10 border border-primary-500/20">
                <p className="text-sm">{rec}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
            <span>Best time: <strong className="text-accent">{predictions.bestTimeToPark}</strong></span>
            <span>Peak hours: <strong className="text-amber-400">{predictions.peakHours?.join(', ')}</strong></span>
          </div>
        </GlassCard>
      )}
    </Layout>
  );
};

export default Dashboard;
