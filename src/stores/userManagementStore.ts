// User profile management (email-based role accounts)
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../lib/roles';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at?: string;
}

interface UserManagementState {
  profiles: UserProfile[];
  loading: boolean;
  error: string | null;

  fetchProfiles: () => Promise<void>;
  createAccount: (email: string, password: string, name: string, role: UserRole, phone?: string) => Promise<boolean>;
  updateProfile: (id: string, updates: Partial<UserProfile>) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
  resetPassword: (id: string, newPassword: string) => Promise<boolean>;
  toggleActive: (id: string, currentStatus: boolean) => Promise<boolean>;
  changeRole: (id: string, newRole: UserRole) => Promise<boolean>;
  syncMissingProfiles: () => Promise<number>;
}

export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  profiles: [],
  loading: false,
  error: null,

  fetchProfiles: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[userManagementStore] Fetch error:', error);
        throw error;
      }

      console.log('[userManagementStore] Fetched profiles:', data?.length || 0, data);
      set({ profiles: data || [] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch users';
      console.error('[userManagementStore] Fetch failed:', message);
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  createAccount: async (email, password, name, role, phone) => {
    set({ loading: true, error: null });
    try {
      // 1. Create auth user with email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, email },
        },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          email,
          name,
          role,
          phone,
        }]);
      if (profileError) throw profileError;

      // 3. Refresh list
      set((state) => ({
        profiles: [{
          id: authData.user!.id,
          email,
          name,
          role,
          phone,
          is_active: true,
        }, ...state.profiles],
      }));
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to create account' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update profile' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      // Delete profile first (CASCADE will delete auth user)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        profiles: state.profiles.filter((p) => p.id !== id),
      }));
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete account' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (_id: string, newPassword: string) => {
    set({ loading: true, error: null });
    try {
      // Note: Client-side password reset requires the user to be logged in.
      // For admin password resets, use Supabase Dashboard → Authentication → Users
      // or implement a server-side Edge Function with service_role key.
      // This is a placeholder that only works for the current logged-in user.
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to reset password' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  toggleActive: async (id: string, currentStatus: boolean) => {
    set({ loading: true, error: null });
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: newStatus })
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, is_active: newStatus } : p)),
      }));
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update status' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  changeRole: async (id, newRole) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, role: newRole } : p)),
      }));
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to change role' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Sync missing auth users to user_profiles (run once after manual auth user creation)
  syncMissingProfiles: async () => {
    set({ loading: true, error: null });
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const { data: existingProfiles } = await supabase
        .from('user_profiles')
        .select('id');

      const existingIds = new Set(existingProfiles?.map(p => p.id) || []);
      const missingUsers = authUsers.users.filter(u => !existingIds.has(u.id));

      let synced = 0;
      for (const user of missingUsers) {
        const email = user.email || '';
        const name = user.user_metadata?.name || email.split('@')[0] || 'Unknown';
        const role = user.user_metadata?.role || 'cashier';

        await supabase.from('user_profiles').insert([{
          id: user.id,
          email,
          name,
          role,
          is_active: true,
        }]);
        synced++;
      }

      console.log(`[userManagementStore] Synced ${synced} missing profiles`);
      await get().fetchProfiles();
      return synced;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to sync profiles';
      console.error('[userManagementStore] Sync failed:', message);
      set({ error: message });
      return 0;
    } finally {
      set({ loading: false });
    }
  },
}));
