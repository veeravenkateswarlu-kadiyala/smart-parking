import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiSun, FiMoon, FiBell, FiMail, FiShield } from 'react-icons/fi';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState({
    notifications: user?.preferences?.notifications ?? true,
    emailAlerts: user?.preferences?.emailAlerts ?? true,
  });

  const savePrefs = async () => {
    try {
      const { data } = await authAPI.updateProfile({ preferences: { ...user?.preferences, ...prefs, theme } });
      updateUser(data.user);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  return (
    <Layout title="Settings" subtitle="Customize your experience">
      <div className="max-w-2xl space-y-6">
        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FiSun /> Appearance</h3>
          <div className="flex gap-3">
            {[{ id: 'dark', icon: FiMoon, label: 'Dark' }, { id: 'light', icon: FiSun, label: 'Light' }].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTheme(id)} className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${theme === id ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:bg-white/5'}`}>
                <Icon size={24} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FiBell /> Notifications</h3>
          <div className="space-y-4">
            {[
              { key: 'notifications', icon: FiBell, label: 'Push Notifications', desc: 'Browser and in-app alerts' },
              { key: 'emailAlerts', icon: FiMail, label: 'Email Alerts', desc: 'Booking and payment emails' },
            ].map(({ key, icon: Icon, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Icon className="text-slate-400" />
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, [key]: !prefs[key] })}
                  className={`w-12 h-6 rounded-full transition-all ${prefs[key] ? 'bg-primary-500' : 'bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${prefs[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FiShield /> Security</h3>
          <p className="text-sm text-slate-400 mb-4">Account verified: {user?.isVerified ? 'Yes' : 'No'}</p>
          <a href="/forgot-password" className="btn-secondary text-sm inline-block">Change Password</a>
        </GlassCard>

        <button onClick={savePrefs} className="btn-primary w-full">Save Settings</button>
      </div>
    </Layout>
  );
};

export default Settings;
