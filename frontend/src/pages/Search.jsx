import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { SlotBadge, formatCurrency } from '../utils/helpers';
import { parkingAPI } from '../services/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await parkingAPI.search(query);
      setResults(data.results);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Search" subtitle="Search by slot ID, vehicle number, user name, or booking ID">
      <form onSubmit={handleSearch} className="max-w-2xl mb-8">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-12 text-lg"
            placeholder="Search slots, bookings, users, vehicles..."
          />
        </div>
      </form>

      {loading && <p className="text-slate-400">Searching...</p>}

      {results && (
        <div className="grid lg:grid-cols-2 gap-6">
          {results.slots?.length > 0 && (
            <GlassCard>
              <h3 className="font-semibold mb-4">Parking Slots ({results.slots.length})</h3>
              {results.slots.map((s) => (
                <div key={s._id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 mb-2">
                  <span className="font-medium">{s.slotId}</span>
                  <SlotBadge status={s.status} />
                </div>
              ))}
            </GlassCard>
          )}

          {results.bookings?.length > 0 && (
            <GlassCard>
              <h3 className="font-semibold mb-4">Bookings ({results.bookings.length})</h3>
              {results.bookings.map((b) => (
                <div key={b._id} className="p-3 rounded-xl bg-white/5 mb-2">
                  <p className="font-medium">{b.bookingId}</p>
                  <p className="text-sm text-slate-400">{b.user?.name} • {b.slot?.slotId} • {formatCurrency(b.amount)}</p>
                </div>
              ))}
            </GlassCard>
          )}

          {results.users?.length > 0 && (
            <GlassCard>
              <h3 className="font-semibold mb-4">Users ({results.users.length})</h3>
              {results.users.map((u) => (
                <div key={u._id} className="p-3 rounded-xl bg-white/5 mb-2">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-slate-400">{u.email}</p>
                </div>
              ))}
            </GlassCard>
          )}

          {results.vehicles?.length > 0 && (
            <GlassCard>
              <h3 className="font-semibold mb-4">Vehicles ({results.vehicles.length})</h3>
              {results.vehicles.map((v) => (
                <div key={v._id} className="p-3 rounded-xl bg-white/5 mb-2">
                  <p className="font-medium">{v.vehicleNumber}</p>
                  <p className="text-sm text-slate-400">{v.user?.name} • {v.vehicleType}</p>
                </div>
              ))}
            </GlassCard>
          )}

          {!results.slots?.length && !results.bookings?.length && !results.users?.length && !results.vehicles?.length && (
            <p className="text-slate-400 col-span-full text-center py-8">No results found for "{query}"</p>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Search;
