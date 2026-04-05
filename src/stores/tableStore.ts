// Store for managing restaurant tables
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface TableItem {
  id?: number;
  table_number: number;
  seats: number;
  is_active: boolean;
  created_at?: string;
}

interface TableState {
  tables: TableItem[];
  loading: boolean;
  error: string | null;
  fetchTables: () => Promise<void>;
  addTable: (table: Omit<TableItem, 'id'>) => Promise<boolean>;
  updateTable: (id: number, updates: Partial<TableItem>) => Promise<boolean>;
  deleteTable: (id: number) => Promise<boolean>;
}

export const useTableStore = create<TableState>((set) => ({
  tables: [],
  loading: false,
  error: null,

  fetchTables: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number', { ascending: true });
      if (error) throw error;
      set({ tables: data || [] });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch tables' });
    } finally {
      set({ loading: false });
    }
  },

  addTable: async (table) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tables')
        .insert([table])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ tables: [...state.tables, data].sort((a, b) => a.table_number - b.table_number) }));
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to add table' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateTable: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('tables')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        tables: state.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update table' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteTable: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('tables').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ tables: state.tables.filter((t) => t.id !== id) }));
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete table' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
