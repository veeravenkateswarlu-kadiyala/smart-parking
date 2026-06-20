import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiDownload, FiCreditCard } from 'react-icons/fi';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { formatCurrency } from '../utils/helpers';
import { paymentAPI } from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    try {
      const { data } = await paymentAPI.getAll();
      setPayments(data.payments || []);
    } catch {
      setPayments([]);
    }
  };

  const downloadInvoice = async (id, invoiceNumber) => {
    try {
      const { data } = await paymentAPI.getInvoice(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      a.click();
    } catch {
      toast.error('Invoice download failed');
    }
  };

  const statusColors = {
    success: 'text-emerald-400 bg-emerald-500/20',
    pending: 'text-amber-400 bg-amber-500/20',
    failed: 'text-red-400 bg-red-500/20',
  };

  return (
    <Layout title="Payments" subtitle="Payment history and invoices">
      <div className="grid gap-4">
        {payments.map((p, i) => (
          <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard hover={false} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <FiCreditCard className="text-primary-400" />
                </div>
                <div>
                  <p className="font-medium">{p.invoiceNumber || 'Payment'}</p>
                  <p className="text-sm text-slate-400">{new Date(p.createdAt).toLocaleString()} • {p.method}</p>
                  {p.transactionId && <p className="text-xs text-slate-500">TXN: {p.transactionId}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display font-bold text-lg">{formatCurrency(p.amount)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[p.status]}`}>{p.status}</span>
                {p.status === 'success' && (
                  <button onClick={() => downloadInvoice(p._id, p.invoiceNumber)} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1">
                    <FiDownload size={14} /> Invoice
                  </button>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {payments.length === 0 && (
          <GlassCard className="text-center py-12">
            <FiCreditCard className="mx-auto text-4xl text-slate-500 mb-4" />
            <p className="text-slate-400">No payment history yet</p>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
};

export default Payments;
