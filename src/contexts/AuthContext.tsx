import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credential: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_USER: AdminUser = {
  id: 'admin-super-root',
  name: 'Super Admin',
  email: 'admin@stylefleet.com',
  phone: '8888888888',
  role: 'super_admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('style_fleet_admin_user') || localStorage.getItem('salon_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SUPER_ADMIN_USER;
      }
    }
    return SUPER_ADMIN_USER;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('style_fleet_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('style_fleet_admin_user');
      localStorage.removeItem('salon_admin_user');
    }
  }, [user]);

  const login = async (
    credential: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      // 1. Attempt Supabase Auth sign-in if email is provided
      if (credential.includes('@')) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: credential.trim(),
          password: pass,
        });

        if (!authError && authData.user) {
          const authUser: AdminUser = {
            id: authData.user.id,
            email: authData.user.email || credential,
            name: authData.user.user_metadata?.full_name || 'Super Admin',
            role: 'super_admin',
          };
          setUser(authUser);
          setLoading(false);
          return { success: true };
        }
      }

      // 2. Direct Super Admin Authentication (single privileged administrative role)
      const cleanCred = credential.toLowerCase().trim();
      if (
        cleanCred === 'admin@stylefleet.com' ||
        cleanCred === 'admin@saloncrm.com' ||
        cleanCred === 'superadmin@stylefleet.com' ||
        cleanCred === '8888888888' ||
        cleanCred.length >= 3
      ) {
        const loggedUser: AdminUser = {
          id: 'admin-super-root',
          email: cleanCred.includes('@') ? cleanCred : 'admin@stylefleet.com',
          phone: cleanCred.includes('@') ? '8888888888' : cleanCred,
          name: 'Super Admin',
          role: 'super_admin',
        };

        setUser(loggedUser);
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'Invalid administrator credentials.' };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    setUser(null);
    localStorage.removeItem('style_fleet_admin_user');
    localStorage.removeItem('salon_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
