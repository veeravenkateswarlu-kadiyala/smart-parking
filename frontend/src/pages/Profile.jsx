import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { authAPI, vehicleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({ vehicleNumber: '', vehicleType: 'car', brand: '', color: '' });
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '' });
    loadVehicles();
  }, [user]);

  const loadVehicles = async () => {
    try {
      const { data } = await vehicleAPI.getAll();
      setVehicles(data.vehicles || []);
    } catch {}
  };

  const handleSave = async () => {
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleAddVehicle = async () => {
    try {
      await vehicleAPI.create(newVehicle);
      toast.success('Vehicle added');
      setShowAddVehicle(false);
      setNewVehicle({ vehicleNumber: '', vehicleType: 'car', brand: '', color: '' });
      loadVehicles();
    } catch {
      toast.error('Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = async (id) => {
    await vehicleAPI.delete(id);
    loadVehicles();
    toast.success('Vehicle removed');
  };

  return (
    <Layout title="Profile" subtitle="Manage your account and vehicles">
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user?.name}</h3>
              <p className="text-slate-400">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'name', icon: FiUser, label: 'Full Name' },
              { key: 'email', icon: FiMail, label: 'Email', disabled: true },
              { key: 'phone', icon: FiPhone, label: 'Phone' },
              { key: 'address', icon: FiMapPin, label: 'Address' },
            ].map(({ key, icon: Icon, label, disabled }) => (
              <div key={key}>
                <label className="text-sm text-slate-400 flex items-center gap-2 mb-2"><Icon size={14} /> {label}</label>
                <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input-field" disabled={disabled} />
              </div>
            ))}
            <button onClick={handleSave} className="btn-primary w-full">Save Changes</button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My Vehicles</h3>
            <button onClick={() => setShowAddVehicle(!showAddVehicle)} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1">
              <FiPlus /> Add
            </button>
          </div>
          {showAddVehicle && (
            <div className="p-4 rounded-xl bg-white/5 mb-4 space-y-3">
              <input value={newVehicle.vehicleNumber} onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value.toUpperCase() })} className="input-field" placeholder="Vehicle Number" />
              <select value={newVehicle.vehicleType} onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.target.value })} className="input-field">
                {['car', 'suv', 'bike', 'truck', 'ev'].map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
              <button onClick={handleAddVehicle} className="btn-primary w-full text-sm">Add Vehicle</button>
            </div>
          )}
          <div className="space-y-3">
            {vehicles.map((v) => (
              <div key={v._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium">{v.vehicleNumber}</p>
                  <p className="text-sm text-slate-400 capitalize">{v.vehicleType} {v.brand && `• ${v.brand}`} {v.isEV && '• EV'}</p>
                </div>
                <button onClick={() => handleDeleteVehicle(v._id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"><FiTrash2 /></button>
              </div>
            ))}
            {vehicles.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No vehicles registered</p>}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Profile;
