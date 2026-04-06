// Auth store using Supabase
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../lib/roles';

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => Promise<void>;
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

// Update staff status in the staff table (matched by email)
// If no staff record exists, create one
const updateStaffStatus = async (email: string | undefined, status: 'on-duty' | 'off-duty', name?: string, role?: UserRole) => {
  if (!email) return;
  try {
    // Check if staff record exists
    const { data: existing } = await supabase
      .from('staff')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      // Update existing staff record
      await supabase
        .from('staff')
        .update({ status })
        .eq('email', email);
    } else if (status === 'on-duty') {
      // Create new staff record on first login
      await supabase
        .from('staff')
        .insert([{
          name: name || email.split('@')[0],
          role: role || 'cashier',
          email,
          status: 'on-duty',
        }]);
    }
  } catch (e) {
    console.error('[authStore] Failed to update staff status:', e);
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: getSavedRole(),
  loading: true,
  initialized: false,
  setUser: async (user) => {
    set({ user, loading: false });
    // Sync staff status: mark on-duty on login
    if (user) {
      const currentRole = useAuthStore.getState().role;
      const name = user.user_metadata?.name || user.email?.split('@')[0];
      await updateStaffStatus(user.email, 'on-duty', name, currentRole);
    }
  },
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
    // Mark off-duty before signing out
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      await updateStaffStatus(currentUser.email, 'off-duty');
    }
    localStorage.removeItem(ROLE_KEY);
    await supabase.auth.signOut();
    set({ user: null, role: DEFAULT_ROLE, loading: false });
  },
}));
