// Realtime notification badge counts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface NotificationState {
  pendingOrders: number;     // For Kitchen badge
  preparingOrders: number;   // For Kitchen badge
  readyOrders: number;       // For Kitchen badge
  servedOrders: number;      // For Kitchen badge
  pendingKitchenCount: number; // Kitchen: pending + preparing
  servedReadyCount: number;    // Kitchen: ready orders waiting
  newOrderCount: number;       // Orders: new/pending orders

  subscribe: () => void;
  unsubscribe: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  pendingOrders: 0,
  preparingOrders: 0,
  readyOrders: 0,
  servedOrders: 0,
  pendingKitchenCount: 0,
  servedReadyCount: 0,
  newOrderCount: 0,

  subscribe: () => {
    const updateCounts = async () => {
      const { data } = await supabase
        .from('orders')
        .select('status');

      if (data) {
        const pending = data.filter(o => o.status === 'pending').length;
        const preparing = data.filter(o => o.status === 'preparing').length;
        const ready = data.filter(o => o.status === 'ready').length;
        const served = data.filter(o => o.status === 'served').length;

        set({
          pendingOrders: pending,
          preparingOrders: preparing,
          readyOrders: ready,
          servedOrders: served,
          pendingKitchenCount: pending + preparing,
          servedReadyCount: ready + served,
          newOrderCount: pending,
        });
      }
    };

    updateCounts();

    const channel = supabase
      .channel('notification-badges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        updateCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  unsubscribe: () => {
    supabase.removeChannel(supabase.channel('notification-badges'));
  },
}));
