import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMapPin, FiClock, FiShield, FiZap, FiBarChart2, FiNavigation } from 'react-icons/fi';

const features = [
  { icon: FiMapPin, title: 'Smart Slot Booking', desc: 'Reserve parking in real-time with instant QR confirmation' },
  { icon: FiNavigation, title: 'Live Traffic Management', desc: 'Real-time traffic density, alerts, and alternate routes' },
  { icon: FiZap, title: 'AI Predictions', desc: 'ML-powered occupancy forecasts and optimal parking times' },
  { icon: FiBarChart2, title: 'Advanced Analytics', desc: 'Comprehensive dashboards with revenue and occupancy insights' },
  { icon: FiClock, title: 'Reservation Timer', desc: 'Auto-expiring reservations with smart slot management' },
  { icon: FiShield, title: 'Secure Payments', desc: 'Razorpay integration with instant invoicing' },
];

const Landing = () => (
  <div className="min-h-screen bg-slate-950 overflow-hidden">
    <div className="fixed inset-0 bg-gradient-to-br from-primary-900/30 via-slate-950 to-accent/20 pointer-events-none" />
    <div className="fixed top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
    <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />

    <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <span className="font-display font-bold text-xl">ParkSmart</span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/login" className="btn-secondary text-sm px-5 py-2">Login</Link>
        <Link to="/register" className="btn-primary text-sm px-5 py-2">Get Started</Link>
      </div>
    </nav>

    <section className="relative z-10 px-6 lg:px-12 pt-16 pb-32 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-accent mb-8">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          Next-Gen Smart Parking Platform
        </div>
        <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight max-w-4xl">
          Park Smarter.
          <span className="bg-gradient-to-r from-primary-400 to-accent bg-clip-text text-transparent"> Move Faster.</span>
        </h1>
        <p className="text-xl text-slate-400 mt-6 max-w-2xl leading-relaxed">
          AI-powered parking and traffic management with real-time updates, smart recommendations, and seamless payments.
        </p>
        <div className="flex flex-wrap gap-4 mt-10">
          <Link to="/register" className="btn-primary flex items-center gap-2">
            Start Free <FiArrowRight />
          </Link>
          <Link to="/login" className="btn-secondary">View Demo</Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Parking Slots', value: '48+' },
          { label: 'Live Updates', value: 'Real-time' },
          { label: 'AI Accuracy', value: '92%' },
          { label: 'Happy Users', value: '10K+' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 text-center">
            <p className="text-3xl font-bold font-display bg-gradient-to-r from-primary-400 to-accent bg-clip-text text-transparent">{stat.value}</p>
            <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>

    <section className="relative z-10 px-6 lg:px-12 py-24 max-w-7xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-center mb-16">Powerful Features</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 hover:bg-white/[0.07] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <f.icon className="text-accent text-xl" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    <footer className="relative z-10 border-t border-white/10 py-8 text-center text-slate-500 text-sm">
      © 2026 ParkSmart. Smart Parking & Traffic Management System.
    </footer>
  </div>
);

export default Landing;
