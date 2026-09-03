import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSalons } from './SalonContext';

export interface LiveNotification {
  id: string;
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  title: string;
  message: string;
  timestamp: string;
}

interface RealtimeContextType {
  liveNotifications: LiveNotification[];
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  isSubscribed: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { refreshSalons } = useSalons();
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to database changes across key tables
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          let title = 'Appointment Update';
          let message = 'An appointment was updated in the system.';

          if (payload.eventType === 'INSERT') {
            title = 'New Appointment Booked';
            message = `New appointment for "${(payload.new as any)?.service_name || 'service'}"`;
          } else if (payload.eventType === 'UPDATE') {
            const status = (payload.new as any)?.status;
            title = `Appointment Status: ${status?.toUpperCase()}`;
            message = `Appointment was changed to ${status}`;
          }

          addLiveNotification({
            id: `notif-${Date.now()}-${Math.random()}`,
            table: 'appointments',
            eventType: payload.eventType,
            title,
            message,
            timestamp: new Date().toISOString(),
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            addLiveNotification({
              id: `notif-${Date.now()}-${Math.random()}`,
              table: 'customers',
              eventType: 'INSERT',
              title: 'New Customer Registered',
              message: `Customer "${(payload.new as any)?.name || 'Client'}" was registered.`,
              timestamp: new Date().toISOString(),
            });
            refreshSalons();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bills' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            addLiveNotification({
              id: `notif-${Date.now()}-${Math.random()}`,
              table: 'bills',
              eventType: 'INSERT',
              title: 'New Invoice Generated',
              message: `Bill of ₹${(payload.new as any)?.total || 0} recorded.`,
              timestamp: new Date().toISOString(),
            });
            refreshSalons();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'salons' },
        () => {
          refreshSalons();
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshSalons]);

  const addLiveNotification = (notif: LiveNotification) => {
    setLiveNotifications((prev) => [notif, ...prev.slice(0, 19)]);
  };

  const clearNotification = (id: string) => {
    setLiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setLiveNotifications([]);
  };

  return (
    <RealtimeContext.Provider
      value={{
        liveNotifications,
        clearNotification,
        clearAllNotifications,
        isSubscribed,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
