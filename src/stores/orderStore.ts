// CRUD for Orders
import { create } from 'zustand';
import type { Order, OrderItem } from '../types';
import { supabase } from '../lib/supabase';
import { useRecipeStore } from './recipeStore';

interface OrderState {
  orders: (Order & { items?: OrderItem[] })[];
  loading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  addOrder: (newOrder: Omit<Order, 'id' | 'order_number'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) => Promise<string>;
  updateOrder: (id: number, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
}

// Generate unique order number: ORD-YYYYMMDD-XXX
function generateOrderNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `ORD-${date}-${seq}`;
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

      // Normalize: Supabase returns joined data under 'order_items', map it to 'items'
      const normalized = (data || []).map((order: Record<string, unknown>) => {
        const { order_items, ...rest } = order;
        return {
          ...rest,
          items: (order_items as unknown) || [],
        } as Order & { items?: OrderItem[] };
      });
      set({ orders: normalized });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch orders' });
    } finally {
      set({ loading: false });
    }
  },

  addOrder: async (newOrder, items) => {
    set({ loading: true, error: null });
    try {
      const orderNumber = generateOrderNumber();

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ ...newOrder, order_number: orderNumber }])
        .select()
        .single();
      if (orderError) throw orderError;

      if (items.length > 0) {
        const itemsWithOrderId = items.map((item) => ({ ...item, order_id: orderData.id }));
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsWithOrderId);
        if (itemsError) throw itemsError;

        // Record stock movements for each item sold
        const movementRecords = items.map((item) => ({
          product_id: item.product_id,
          movement_type: 'sale' as const,
          quantity: item.quantity,
          unit: 'pcs',
          reference: orderNumber,
          notes: `Order ${orderNumber}`,
        }));
        await supabase.from('stock_movements').insert(movementRecords);

        // Deduct stock for each item
        for (const item of items) {
          // Check if product_id refers to a recipe (product_id > 100000 = recipe ID convention)
          const isRecipe = item.product_id > 100000;

          if (isRecipe) {
            const recipeId = item.product_id - 100000;
            await useRecipeStore.getState().deductIngredients(recipeId, item.quantity);
          } else {
            // Regular product — deduct stock directly
            const { data: product } = await supabase
              .from('products')
              .select('stock_quantity')
              .eq('id', item.product_id)
              .single();
            if (product) {
              await supabase
                .from('products')
                .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
                .eq('id', item.product_id);
            }
          }
        }
      }

      const enrichedOrder = { ...orderData, items };
      set((state) => ({ orders: [enrichedOrder, ...state.orders] }));
      return orderNumber;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to add order' });
      return '';
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
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update order' });
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
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete order' });
    } finally {
      set({ loading: false });
    }
  },
}));
