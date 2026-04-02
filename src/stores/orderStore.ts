// CRUD for Orders
import { create } from 'zustand';
import type { Order, OrderItem } from '../types';
import { supabase } from '../lib/supabase';

interface OrderState {
  orders: (Order & { items?: OrderItem[] })[];
  loading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  addOrder: (newOrder: Omit<Order, 'id'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) => Promise<void>;
  updateOrder: (id: number, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ orders: data || [] });
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },

  addOrder: async (newOrder, items) => {
    set({ loading: true, error: null });
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ ...newOrder }])
        .select()
        .single();
      if (orderError) throw orderError;

      if (items.length > 0) {
        const itemsWithOrderId = items.map(item => ({ ...item, order_id: orderData.id }));
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsWithOrderId);
        if (itemsError) throw itemsError;
      }

      set((state) => ({ orders: [{ ...orderData, items }, ...state.orders] }));
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },

  updateOrder: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
      }));
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await supabase.from('order_items').delete().eq('order_id', id);
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },
}));
