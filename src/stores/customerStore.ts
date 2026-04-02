// CRUD for Customers
import { create } from 'zustand';
import type { Customer } from '../types';
import { supabase } from '../lib/supabase';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;

  fetchCustomers: () => Promise<void>;
  addCustomer: (newCustomer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: number, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      if (error) throw error;
      set({ customers: data || [] });
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },

  addCustomer: async (newCustomer) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...newCustomer }])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ customers: [data, ...state.customers] }));
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },

  updateCustomer: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },
}));
