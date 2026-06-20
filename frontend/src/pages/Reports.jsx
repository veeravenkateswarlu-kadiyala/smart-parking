import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { analyticsAPI } from '../services/api';

const Reports = () => {
  const [loading, setLoading] = useState('');

  const downloadReport = async (format) => {
    setLoading(format);
    try {
      const { data } = await analyticsAPI.exportReport(format);
      const ext = format === 'excel' ? 'xlsx' : format;
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-report.${ext}`;
      a.click();
      toast.success(`${format.toUpperCase()} report downloaded`);
    } catch {
      toast.error('Export failed');
    } finally {
      setLoading('');
    }
  };

  const reports = [
    { format: 'csv', icon: FiFileText, title: 'CSV Report', desc: 'Comma-separated bookings data' },
    { format: 'excel', icon: FiFile, title: 'Excel Report', desc: 'Formatted spreadsheet with all bookings' },
    { format: 'json', icon: FiDownload, title: 'JSON Export', desc: 'Raw data for integrations' },
  ];

  return (
    <Layout title="Reports" subtitle="Export booking and revenue reports">
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
        {reports.map(({ format, icon: Icon, title, desc }) => (
          <GlassCard key={format} className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon className="text-2xl text-primary-400" />
            </div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-slate-400 mb-4">{desc}</p>
            <button
              onClick={() => downloadReport(format)}
              disabled={loading === format}
              className="btn-primary w-full text-sm flex items-center justify-center gap-2"
            >
              <FiDownload /> {loading === format ? 'Exporting...' : 'Download'}
            </button>
          </GlassCard>
        ))}
      </div>
    </Layout>
  );
};

export default Reports;
