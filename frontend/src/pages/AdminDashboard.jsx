import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiGrid, FiDollarSign, FiCalendar } from 'react-icons/fi';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import { SlotBadge, formatCurrency } from '../utils/helpers';
import { analyticsAPI, parkingAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, bookingsRes, slotsRes] = await Promise.all([
        analyticsAPI.getAdminStats(),
        analyticsAPI.getUsers(),
        parkingAPI.getBookings(),
        parkingAPI.getSlots(),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setBookings(bookingsRes.data.bookings || []);
      setSlots(slotsRes.data.slots || []);
    } catch {}
  };

  const updateSlotStatus = async (id, status) => {
    try {
      await parkingAPI.updateSlot(id, { status });
      toast.success('Slot updated');
      loadData();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <Layout title="Admin Dashboard" subtitle="Manage users, slots, bookings, and revenue">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={FiUsers} color="primary" />
        <StatCard title="Total Slots" value={stats?.totalSlots || 0} icon={FiGrid} color="blue" />
        <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon={FiDollarSign} color="green" />
        <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon={FiCalendar} color="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <h3 className="font-semibold mb-4">Users</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map((u) => (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-primary-500/20 text-primary-400' : 'bg-white/10 text-slate-400'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bookings.slice(0, 10).map((b) => (
              <div key={b._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-sm">
                <div>
                  <p className="font-medium">{b.bookingId}</p>
                  <p className="text-xs text-slate-400">{b.user?.name} • {b.slot?.slotId}</p>
                </div>
                <span className="text-accent">{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-semibold mb-4">Manage Parking Slots</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="text-left py-3 px-2">Slot ID</th>
                <th className="text-left py-3 px-2">Zone</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Type</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.slice(0, 20).map((slot) => (
                <tr key={slot._id} className="border-b border-white/5">
                  <td className="py-3 px-2 font-medium">{slot.slotId}</td>
                  <td className="py-3 px-2">{slot.zone}</td>
                  <td className="py-3 px-2"><SlotBadge status={slot.status} /></td>
                  <td className="py-3 px-2 capitalize">{slot.type}</td>
                  <td className="py-3 px-2">
                    <select
                      value={slot.status}
                      onChange={(e) => updateSlotStatus(slot._id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs"
                    >
                      {['available', 'occupied', 'reserved', 'maintenance'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </Layout>
  );
};

export default AdminDashboard;
