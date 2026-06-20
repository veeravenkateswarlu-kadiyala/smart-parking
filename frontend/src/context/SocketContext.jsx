import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [slotUpdates, setSlotUpdates] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    newSocket.on('dashboardUpdate', (data) => setDashboardData(data));
    newSocket.on('slotUpdate', (data) => setSlotUpdates(data));
    newSocket.on('trafficUpdate', (data) => setTrafficData(data));
    newSocket.on('notification', (notification) => {
      toast(notification.message, { icon: '🔔' });
      if (Notification.permission === 'granted') {
        new Notification(notification.title, { body: notification.message });
      }
    });
    newSocket.on('trafficAlert', (data) => {
      toast.error(`Traffic Alert: ${data.alert?.message || 'Road alert'}`, { duration: 6000 });
    });

    newSocket.emit('subscribeDashboard');
    newSocket.emit('subscribeTraffic');

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join', user.id || user._id);
    }
  }, [socket, user]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, dashboardData, trafficData, slotUpdates }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
