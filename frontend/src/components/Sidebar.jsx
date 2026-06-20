import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiMap, FiCalendar, FiBarChart2, FiSettings, FiBell,
  FiUser, FiLogOut, FiMenu, FiX, FiGrid, FiNavigation, FiThermometer,
  FiCreditCard, FiShield, FiSearch, FiSun, FiMoon, FiFileText,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/book', icon: FiCalendar, label: 'Book Parking' },
  { path: '/layout', icon: FiGrid, label: 'Parking Layout' },
  { path: '/traffic', icon: FiNavigation, label: 'Traffic' },
  { path: '/heatmap', icon: FiThermometer, label: 'Heat Maps' },
  { path: '/map', icon: FiMap, label: 'Live Map' },
  { path: '/bookings', icon: FiFileText, label: 'Bookings' },
  { path: '/payments', icon: FiCreditCard, label: 'Payments' },
  { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { path: '/notifications', icon: FiBell, label: 'Notifications' },
  { path: '/search', icon: FiSearch, label: 'Search' },
  { path: '/profile', icon: FiUser, label: 'Profile' },
  { path: '/settings', icon: FiSettings, label: 'Settings' },
];

const adminItems = [
  { path: '/admin', icon: FiShield, label: 'Admin Panel' },
  { path: '/reports', icon: FiFileText, label: 'Reports' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">ParkSmart</h1>
            <p className="text-xs text-slate-400">Traffic Management</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={isActive(item.path) ? 'nav-link-active' : 'nav-link'}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</p>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={isActive(item.path) ? 'nav-link-active' : 'nav-link'}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <button onClick={toggleTheme} className="nav-link w-full">
          {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="nav-link w-full text-red-400 hover:text-red-300"
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl"
      >
        <FiMenu size={24} />
      </button>

      <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 glass border-r border-white/10">
        <NavContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden fixed left-0 top-0 w-72 h-screen glass z-50 flex flex-col"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2">
                <FiX size={24} />
              </button>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
