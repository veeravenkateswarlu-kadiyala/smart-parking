import TrafficData from '../models/TrafficData.js';
import HeatMap from '../models/HeatMap.js';

export const getTrafficData = async (req, res) => {
  try {
    const roads = await TrafficData.find();
    const summary = {
      totalRoads: roads.length,
      low: roads.filter((r) => r.density === 'low').length,
      medium: roads.filter((r) => r.density === 'medium').length,
      heavy: roads.filter((r) => r.density === 'heavy').length,
      totalVehicles: roads.reduce((sum, r) => sum + r.vehicleCount, 0),
      averageSpeed: roads.length ? Math.round(roads.reduce((sum, r) => sum + r.averageSpeed, 0) / roads.length) : 0,
      activeAlerts: roads.reduce((sum, r) => sum + r.alerts.filter((a) => a.active).length, 0),
    };
    res.json({ success: true, roads, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoadById = async (req, res) => {
  try {
    const road = await TrafficData.findOne({ roadId: req.params.id });
    if (!road) return res.status(404).json({ success: false, message: 'Road not found' });
    res.json({ success: true, road });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTraffic = async (req, res) => {
  try {
    const road = await TrafficData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const io = req.app.get('io');
    io?.emit('trafficUpdate', road);
    res.json({ success: true, road });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTrafficAlert = async (req, res) => {
  try {
    const road = await TrafficData.findById(req.params.id);
    road.alerts.push(req.body);
    await road.save();
    const io = req.app.get('io');
    io?.emit('trafficAlert', { road, alert: req.body });
    res.json({ success: true, road });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHeatMaps = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const heatMaps = await HeatMap.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, heatMaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlternateRoutes = async (req, res) => {
  try {
    const { from, to } = req.query;
    const roads = await TrafficData.find();
    const routes = roads
      .filter((r) => r.density !== 'heavy')
      .map((r) => ({
        name: r.roadName,
        eta: Math.round(r.averageSpeed > 0 ? 10 / (r.averageSpeed / 60) : 15),
        distance: Math.round(Math.random() * 10 + 5),
        density: r.density,
        status: r.status,
      }))
      .sort((a, b) => a.eta - b.eta);

    res.json({ success: true, from, to, routes: routes.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
