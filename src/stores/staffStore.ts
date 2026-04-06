// CRUD for Staff with Supabase Realtime
import { create } from 'zustand';
import type { Staff } from '../types';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface StaffState {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  _subscribed: boolean;
  _channel: RealtimeChannel | null;

  fetchStaff: () => Promise<void>;
  addStaff: (newStaff: Omit<Staff, 'id'>) => Promise<void>;
  updateStaff: (id: number, updates: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: number) => Promise<void>;
  subscribe: () => void;
  unsubscribe: () => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [],
  loading: false,
  error: null,
  _subscribed: false,
  _channel: null,

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

  // Subscribe to realtime staff status changes
  subscribe: () => {
    // Always remove existing channel first to prevent duplicates (HMR/dev mode)
    get().unsubscribe();

    const channel = supabase
      .channel('staff-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'staff' },
        (payload) => {
          set((state) => ({ staff: [payload.new as Staff, ...state.staff] }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'staff' },
        (payload) => {
          const updated = payload.new as Staff;
          set((state) => ({
            staff: state.staff.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'staff' },
        (payload) => {
          const deleted = payload.old as Staff;
          set((state) => ({
            staff: state.staff.filter((s) => s.id !== deleted.id),
          }));
        }
      )
      .subscribe();

    set({ _subscribed: true, _channel: channel });
  },

  unsubscribe: () => {
    const { _channel } = get();
    if (_channel) {
      supabase.removeChannel(_channel);
      set({ _subscribed: false, _channel: null });
    }
  },
}));
