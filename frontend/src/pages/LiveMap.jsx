import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { parkingAPI, trafficAPI } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CENTER = [28.6139, 77.2090];

const LiveMap = () => {
  const [slots, setSlots] = useState([]);
  const [roads, setRoads] = useState([]);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    Promise.all([
      parkingAPI.getSlots(),
      trafficAPI.getAll(),
      parkingAPI.getRecommendations(),
    ]).then(([s, t, r]) => {
      setSlots(s.data.slots || []);
      setRoads(t.data.roads || []);
      setRecommendations(r.data.recommendations);
    }).catch(() => {});
  }, []);

  const statusColor = { available: '#10b981', occupied: '#ef4444', reserved: '#3b82f6', maintenance: '#f59e0b' };

  return (
    <Layout title="Live Map" subtitle="Parking locations, traffic, and navigation">
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
          <MapContainer center={CENTER} zoom={14} style={{ height: '500px', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {slots.map((slot) => (
              <Circle
                key={slot._id}
                center={[slot.location?.lat || CENTER[0], slot.location?.lng || CENTER[1]]}
                radius={30}
                pathOptions={{ color: statusColor[slot.status], fillColor: statusColor[slot.status], fillOpacity: 0.6 }}
              >
                <Popup>
                  <strong>{slot.slotId}</strong><br />
                  Zone {slot.zone} • {slot.status}<br />
                  ₹{slot.pricePerHour}/hr
                </Popup>
              </Circle>
            ))}
            {roads.map((road) => (
              <Marker key={road.roadId} position={[road.location?.lat || CENTER[0], road.location?.lng || CENTER[1]]}>
                <Popup>
                  <strong>{road.roadName}</strong><br />
                  {road.density} traffic • {road.averageSpeed} km/h
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <h3 className="font-semibold mb-3">Smart Recommendations</h3>
            {recommendations && (
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 font-medium">Nearest Parking</p>
                  <p className="text-slate-400">{recommendations.nearest?.[0]?.slotId || 'Zone A'}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 font-medium">Best Route</p>
                  <p className="text-slate-400">{recommendations.bestRoute}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-accent font-medium">Best Arrival</p>
                  <p className="text-slate-400">{recommendations.bestArrivalTime}</p>
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold mb-3">Nearby Services</h3>
            <div className="space-y-2 text-sm text-slate-400">
              {['Fuel Stations (3)', 'EV Charging (2)', 'Restaurants (8)', 'Hospitals (2)', 'Service Centers (4)'].map((s) => (
                <p key={s} className="p-2 rounded-lg bg-white/5">{s}</p>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
};

export default LiveMap;
