const SLOT_COLORS = {
  available: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  occupied: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', dot: 'bg-red-500' },
  reserved: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', dot: 'bg-blue-500' },
  maintenance: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', dot: 'bg-amber-500' },
};

export const getSlotStyle = (status) => SLOT_COLORS[status] || SLOT_COLORS.available;

export const SlotBadge = ({ status }) => {
  const style = getSlotStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}/30`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

export const calculatePrice = (hours) => Math.min(Math.max(1, hours), 24) * 100;

export const TRAFFIC_COLORS = {
  green: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  yellow: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  red: 'text-red-400 bg-red-500/20 border-red-500/30',
};

export const DENSITY_LABELS = { low: 'Low', medium: 'Medium', heavy: 'Heavy' };
