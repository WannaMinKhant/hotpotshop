// CRUD for Staff
import { create } from 'zustand';
import type { Staff } from '../types';
import { supabase } from '../lib/supabase';

interface StaffState {
  staff: Staff[];
  loading: boolean;
  error: string | null;

  fetchStaff: () => Promise<void>;
  addStaff: (newStaff: Omit<Staff, 'id'>) => Promise<void>;
  updateStaff: (id: number, updates: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: number) => Promise<void>;
}

export const useStaffStore = create<StaffState>((set) => ({
  staff: [],
  loading: false,
  error: null,

  fetchStaff: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ staff: data || [] });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch staff' });
    } finally {
      set({ loading: false });
    }
  },

  addStaff: async (newStaff) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert([newStaff])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ staff: [data, ...state.staff] }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to add staff' });
    } finally {
      set({ loading: false });
    }
  },

  updateStaff: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        staff: state.staff.map((s) => (s.id === id ? { ...s, ...data } : s)),
      }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update staff' });
    } finally {
      set({ loading: false });
    }
  },

  deleteStaff: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ staff: state.staff.filter((s) => s.id !== id) }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete staff' });
    } finally {
      set({ loading: false });
    }
  },
}));
