import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent/10 pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold">Create Account</h1>
          <p className="text-slate-400 mt-2">Join ParkSmart today</p>
        </div>
        <form onSubmit={handleSubmit} className="glass p-8 space-y-4">
          {[
            { key: 'name', icon: FiUser, placeholder: 'Full Name', type: 'text' },
            { key: 'email', icon: FiMail, placeholder: 'Email Address', type: 'email' },
            { key: 'phone', icon: FiPhone, placeholder: 'Phone Number', type: 'tel' },
            { key: 'password', icon: FiLock, placeholder: 'Password (min 6 chars)', type: 'password' },
          ].map(({ key, icon: Icon, placeholder, type }) => (
            <div key={key} className="relative">
              <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="input-field pl-11"
                placeholder={placeholder}
                required
                minLength={key === 'password' ? 6 : undefined}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-primary-400">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
