// Real-time notification store for Kitchen and Orders badges
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface NotificationState {
  kitchenCount: number;
  ordersCount: number;
  loading: boolean;
  _channel: ReturnType<typeof supabase.channel> | null;

  // Kitchen new item alerts — individual items that were added to orders already in progress
  newItemIds: Set<number>;
  addNewItemId: (orderItemId: number) => void;
  removeNewItemId: (orderItemId: number) => void;
  clearNewItemIds: () => void;

  fetchCounts: () => Promise<void>;
  subscribeToOrders: () => void;
  unsubscribe: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  kitchenCount: 0,
  ordersCount: 0,
  loading: false,
  _channel: null,
  newItemIds: new Set<number>(),

  addNewItemId: (orderItemId: number) => {
    set((state) => {
      const newSet = new Set(state.newItemIds);
      newSet.add(orderItemId);
      return { newItemIds: newSet };
    });
  },

  removeNewItemId: (orderItemId: number) => {
    set((state) => {
      const newSet = new Set(state.newItemIds);
      newSet.delete(orderItemId);
      return { newItemIds: newSet };
    });
  },

  clearNewItemIds: () => {
    set({ newItemIds: new Set<number>() });
  },

  fetchCounts: async () => {
    set({ loading: true });
    try {
      // Count kitchen items (pending + preparing + ready)
      const { count: kitchenCount } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'preparing', 'ready']);

      // Count non-completed orders for Orders page
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '(completed,cancelled)');

      set({
        kitchenCount: kitchenCount || 0,
        ordersCount: ordersCount || 0,
        loading: false,
      });
    } catch (e) {
      console.error('[notificationStore] Failed to fetch counts:', e);
      set({ loading: false });
    }
  },

  subscribeToOrders: () => {
    // Unsubscribe existing
    get().unsubscribe();

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async () => {
          console.log('[notificationStore] Orders change detected');
          // Refresh counts on any order change
          await get().fetchCounts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        async () => {
          console.log('[notificationStore] Order items change detected');
          // Refresh counts on any order item change
          await get().fetchCounts();
        }
      )
      .subscribe();

    set({ _channel: channel });
  },

  unsubscribe: () => {
    const channel = get()._channel;
    if (channel) {
      supabase.removeChannel(channel);
      set({ _channel: null });
    }
  },
}));
