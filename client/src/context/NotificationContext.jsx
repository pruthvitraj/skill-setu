import { createContext, useContext, useEffect, useState } from 'react';
import { notificationApi } from '../services/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) return;
    notificationApi
      .list()
      .then((res) => setItems(res.data.items || []))
      .catch(() => setItems([]));
  }, [user]);

  return (
    <NotificationContext.Provider value={{ items, unread: items.filter((n) => !n.read).length, setItems }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
