// Real-time notification store for Kitchen and Orders badges
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationState {
  kitchenCount: number;
  ordersCount: number;
  loading: boolean;
  _channel: RealtimeChannel | null;
  
  fetchCounts: () => Promise<void>;
  subscribeToOrders: () => void;
  unsubscribe: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  kitchenCount: 0,
  ordersCount: 0,
  loading: false,
  _channel: null,

  fetchCounts: async () => {
    set({ loading: true });
    try {
      // Count kitchen orders (pending + preparing + ready)
      const { count: kitchenCount } = await supabase
        .from('orders')
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
