import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheck } from 'react-icons/fi';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { notificationAPI } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setNotifications([]);
    }
  };

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    loadNotifications();
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    loadNotifications();
  };

  const priorityColors = {
    urgent: 'border-l-red-500',
    high: 'border-l-amber-500',
    medium: 'border-l-primary-500',
    low: 'border-l-slate-500',
  };

  return (
    <Layout title="Notifications" subtitle={`${unreadCount} unread notifications`}>
      {unreadCount > 0 && (
        <button onClick={markAllRead} className="btn-secondary text-sm mb-6 flex items-center gap-2">
          <FiCheck /> Mark all as read
        </button>
      )}
      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <GlassCard hover={false} className={`border-l-4 ${priorityColors[n.priority]} ${!n.isRead ? 'bg-white/[0.07]' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FiBell className={`mt-1 ${!n.isRead ? 'text-primary-400' : 'text-slate-500'}`} />
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-slate-400 mt-1">{n.message}</p>
                    <p className="text-xs text-slate-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)} className="text-xs text-primary-400 hover:text-primary-300 shrink-0">Mark read</button>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {notifications.length === 0 && <p className="text-center text-slate-400 py-12">No notifications</p>}
      </div>
    </Layout>
  );
};

export default Notifications;
