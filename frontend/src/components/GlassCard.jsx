import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={hover ? { scale: 1.01 } : {}}
    className={`glass p-6 ${className}`}
  >
    {children}
  </motion.div>
);

export default GlassCard;
