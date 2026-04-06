// Auth store using Supabase (phone-based)
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../lib/roles';

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  fetchRole: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  setInitialized: () => void;
}

const ROLE_KEY = 'b2m_user_role';
const DEFAULT_ROLE: UserRole = 'admin';

// Read saved role from localStorage
const getSavedRole = (): UserRole => {
  try {
    const saved = localStorage.getItem(ROLE_KEY);
    if (saved && ['admin', 'manager', 'cashier', 'chef', 'waiter', 'cleaner'].includes(saved)) {
      return saved as UserRole;
    }
  } catch { /* ignore */ }
  return DEFAULT_ROLE;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: getSavedRole(),
  loading: true,
  initialized: false,
  setUser: (user) => set({ user, loading: false }),
  setInitialized: () => set({ initialized: true }),
  setRole: (role) => {
    localStorage.setItem(ROLE_KEY, role);
    set({ role });
  },

  // Fetch role from user_profiles table
  fetchRole: async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (data?.role) {
        console.log('[authStore] Role fetched:', data.role);
        set({ role: data.role as UserRole });
        localStorage.setItem(ROLE_KEY, data.role);
      }
    } catch (e) {
      console.error('[authStore] Failed to fetch role:', e);
    }
  },

  signOut: async () => {
    localStorage.removeItem(ROLE_KEY);
    await supabase.auth.signOut();
    set({ user: null, role: DEFAULT_ROLE, loading: false });
  },
}));
