import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import { FiBarChart2, FiTrendingUp, FiClock, FiMapPin } from 'react-icons/fi';
import { analyticsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('daily');

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    try {
      const { data: res } = await analyticsAPI.getAnalytics(period);
      setData(res);
    } catch {
      setData(null);
    }
  };

  const zoneData = data?.charts?.zoneBookings
    ? Object.entries(data.charts.zoneBookings).map(([name, value]) => ({ name: `Zone ${name}`, value }))
    : [];

  const vehicleData = data?.analytics?.vehicleTypes
    ? Object.entries(data.analytics.vehicleTypes).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Layout title="Analytics" subtitle="Comprehensive parking and traffic insights">
      <div className="flex gap-3 mb-6">
        {['daily', 'weekly', 'monthly'].map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-xl text-sm capitalize ${period === p ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'glass'}`}>{p}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Bookings" value={data?.analytics?.totalBookings || 0} icon={FiBarChart2} color="primary" />
        <StatCard title="Revenue" value={formatCurrency(data?.analytics?.totalRevenue || 0)} icon={FiTrendingUp} color="green" />
        <StatCard title="Occupancy" value={`${data?.analytics?.occupancyRate || 0}%`} icon={FiClock} color="accent" />
        <StatCard title="Popular Zone" value={data?.analytics?.popularZone || 'A'} icon={FiMapPin} color="yellow" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <GlassCard>
          <h3 className="font-semibold mb-4">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.charts?.dailyRevenue || []}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold mb-4">Hourly Bookings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={(data?.charts?.hourlyBookings || []).map((v, i) => ({ hour: `${i}:00`, bookings: v }))}>
              <XAxis dataKey="hour" stroke="#64748b" fontSize={10} interval={3} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-semibold mb-4">Popular Zones</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={zoneData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {zoneData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold mb-4">Vehicle Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vehicleData} layout="vertical">
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={60} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Analytics;
