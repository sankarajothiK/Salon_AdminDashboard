import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Salon } from '@/types';
import { salonService } from '@/services/salonService';
import { useAuth } from './AuthContext';

interface SalonContextType {
  salons: Salon[];
  selectedSalonId: string; // 'all' or salon.id
  selectedSalon: Salon | null;
  setSelectedSalonId: (salonId: string) => void;
  loading: boolean;
  error: string | null;
  refreshSalons: () => Promise<void>;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

const SELECTED_SALON_KEY = 'salon_crm_selected_salon_id';

export const SalonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalonId, setSelectedSalonIdState] = useState<string>(() => {
    return localStorage.getItem(SELECTED_SALON_KEY) || 'all';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await salonService.getAllSalons();
    if (res.error) {
      setError(res.error);
    } else {
      setSalons(res.data);
      // If current selectedSalonId is not 'all' and not found in fresh live salons, auto-reset to 'all'
      setSelectedSalonIdState((currentId) => {
        if (currentId !== 'all' && !res.data.some((s) => s.id === currentId)) {
          localStorage.setItem(SELECTED_SALON_KEY, 'all');
          return 'all';
        }
        return currentId;
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  // If user is restricted to a specific salon (e.g. salon_admin), enforce it
  useEffect(() => {
    if (user?.role === 'salon_admin' && user.salonId) {
      setSelectedSalonIdState(user.salonId);
    }
  }, [user]);

  const setSelectedSalonId = (id: string) => {
    setSelectedSalonIdState(id);
    localStorage.setItem(SELECTED_SALON_KEY, id);
  };

  const selectedSalon = salons.find((s) => s.id === selectedSalonId) || null;

  return (
    <SalonContext.Provider
      value={{
        salons,
        selectedSalonId,
        selectedSalon,
        setSelectedSalonId,
        loading,
        error,
        refreshSalons: fetchSalons,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalons = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalons must be used within a SalonProvider');
  }
  return context;
};
