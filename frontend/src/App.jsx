import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import BookParking from './pages/BookParking';
import ParkingLayout from './pages/ParkingLayout';
import TrafficDashboard from './pages/TrafficDashboard';
import HeatMaps from './pages/HeatMaps';
import LiveMap from './pages/LiveMap';
import BookingHistory from './pages/BookingHistory';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import Reports from './pages/Reports';
import Search from './pages/Search';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookParking />} />
        <Route path="/layout" element={<ParkingLayout />} />
        <Route path="/traffic" element={<TrafficDashboard />} />
        <Route path="/heatmap" element={<HeatMaps />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/search" element={<Search />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
