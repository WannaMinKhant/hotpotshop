import { useEffect, useMemo, useState } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useNotificationStore } from '../stores/notificationStore';
import type { Order, OrderItem } from '../types';

type EnrichedOrder = Order & { minsAgo: number; timeLabel: string; isUrgent: boolean };
type KitchenItem = OrderItem & { orderNumber: string; orderType: string; tableNumber?: number; orderId: number; created_at?: string; minsAgo: number; timeLabel: string; isUrgent: boolean; isNew: boolean };

// Helper: compute enriched order data from a snapshot timestamp
function enrichOrders(orders: (Order & { items?: OrderItem[] })[], now: number): EnrichedOrder[] {
  return orders.map(o => {
    const created = o.created_at ? new Date(o.created_at).getTime() : now;
    const minsAgo = Math.floor((now - created) / 60000);
    return {
      ...o,
      minsAgo,
      timeLabel: minsAgo < 1 ? 'Just now' : `${minsAgo} min ago`,
      isUrgent: minsAgo > 15,
    };
  });
}

const KitchenPage = () => {
  const { orders, loading, error, fetchOrders, updateOrderItemStatus } = useOrderStore();
  const { kitchenCount, newItemIds } = useNotificationStore();
  const [now, setNow] = useState(Date.now());

  // Update timestamp every 30s so "time ago" stays fresh
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, kitchenCount]); // Re-fetch when count changes

  const enrichedOrders = useMemo(() => enrichOrders(orders, now), [orders, now]);

  // Flatten all items from all orders with order context
  const allKitchenItems: KitchenItem[] = useMemo(() => {
    const items: KitchenItem[] = [];
    for (const order of enrichedOrders) {
      // Skip completed/cancelled orders
      if (['completed', 'cancelled'].includes(order.status)) continue;
      
      if (order.items) {
        for (const item of order.items) {
          // Skip items that are already served
          if (item.status === 'served') continue;

          items.push({
            ...item,
            orderNumber: order.order_number,
            orderType: order.order_type,
            tableNumber: order.table_number,
            orderId: order.id!,
            created_at: order.created_at,
            minsAgo: order.minsAgo,
            timeLabel: order.timeLabel,
            isUrgent: order.isUrgent,
            isNew: newItemIds.has(item.id!),
          });
        }
      }
    }
    return items;
  }, [enrichedOrders, newItemIds]);

  // Group items by status
  const pendingItems = allKitchenItems.filter(i => i.status === 'pending');
  const preparingItems = allKitchenItems.filter(i => i.status === 'preparing');
  const readyItems = allKitchenItems.filter(i => i.status === 'ready');

  // Group items by order for display
  function groupByOrder(items: KitchenItem[]) {
    const groups: Map<string, { orderNumber: string; orderType: string; tableNumber?: number; items: KitchenItem[] }> = new Map();
    for (const item of items) {
      const key = item.orderNumber;
      if (!groups.has(key)) {
        groups.set(key, {
          orderNumber: item.orderNumber,
          orderType: item.orderType,
          tableNumber: item.tableNumber,
          items: [],
        });
      }
      groups.get(key)!.items.push(item);
    }
    return Array.from(groups.values());
  }

  const pendingGroups = groupByOrder(pendingItems);
  const preparingGroups = groupByOrder(preparingItems);
  const readyGroups = groupByOrder(readyItems);

  return (
    <div className="h-screen bg-[#1e2128] p-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">🍲 Kitchen Display</h1>
        <p className="text-gray-400 mt-1">Track individual items — each item moves independently</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-yellow-400 text-sm font-semibold">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{loading ? '...' : pendingItems.length}</p>
          </div>
          <span className="text-3xl">⏳</span>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-sm font-semibold">Cooking</p>
            <p className="text-3xl font-bold text-blue-400">{preparingItems.length}</p>
          </div>
          <span className="text-3xl">🔥</span>
        </div>
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-green-400 text-sm font-semibold">Ready</p>
            <p className="text-3xl font-bold text-green-400">{readyItems.length}</p>
          </div>
          <span className="text-3xl">✅</span>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Loading kitchen items...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400 text-xl">⏳</span>
              <h2 className="text-xl font-bold text-yellow-400">Pending ({pendingItems.length})</h2>
            </div>
            <div className="space-y-3">
              {pendingGroups.length === 0 && (
                <div className="text-center text-gray-500 py-8">No pending items</div>
              )}
              {pendingGroups.map(group => (
                <div
                  key={group.orderNumber}
                  className={`bg-[#272a30] rounded-xl border-2 ${group.items.some(i => i.isUrgent) ? 'border-red-500' : 'border-yellow-500/50'} hover:border-yellow-500 transition-all shadow-lg`}
                >
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg">{group.tableNumber ? `Table ${group.tableNumber}` : group.orderType}</h3>
                      <p className="text-sm text-gray-400">{group.orderNumber} • {group.items[0]?.timeLabel}</p>
                    </div>
                    {group.items.some(i => i.isUrgent) && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">URGENT</span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    {group.items.map(item => (
                      <div key={item.id} className={`flex justify-between items-center text-white ${item.isNew ? 'bg-orange-500/10 border border-orange-500/30 -mx-2 px-2 py-1 rounded' : ''}`}>
                        <div className="flex items-center gap-2">
                          {item.isNew && <span className="text-orange-400 text-xs">🔔</span>}
                          <span>🍽️ {item.product_name}</span>
                          {item.notes && <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">{item.notes}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">x{item.quantity}</span>
                          <button
                            onClick={() => updateOrderItemStatus(item.id!, 'preparing')}
                            className="bg-blue-500 hover:bg-blue-400 text-white text-xs px-3 py-1 rounded font-bold transition"
                          >
                            Start →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-400 text-xl">🔥</span>
              <h2 className="text-xl font-bold text-blue-400">Cooking ({preparingItems.length})</h2>
            </div>
            <div className="space-y-3">
              {preparingGroups.length === 0 && (
                <div className="text-center text-gray-500 py-8">No cooking items</div>
              )}
              {preparingGroups.map(group => (
                <div
                  key={group.orderNumber}
                  className={`bg-[#272a30] rounded-xl border-2 ${group.items.some(i => i.isUrgent) ? 'border-red-500' : 'border-blue-500/50'} hover:border-blue-500 transition-all shadow-lg`}
                >
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg">{group.tableNumber ? `Table ${group.tableNumber}` : group.orderType}</h3>
                      <p className="text-sm text-gray-400">{group.orderNumber} • {group.items[0]?.timeLabel}</p>
                    </div>
                    {group.items.some(i => i.isUrgent) && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">URGENT</span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    {group.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                          <span>🍽️ {item.product_name}</span>
                          {item.notes && <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">{item.notes}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded">x{item.quantity}</span>
                          <button
                            onClick={() => updateOrderItemStatus(item.id!, 'ready')}
                            className="bg-green-500 hover:bg-green-400 text-black text-xs px-3 py-1 rounded font-bold transition"
                          >
                            Ready ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ready Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-400 text-xl">✅</span>
              <h2 className="text-xl font-bold text-green-400">Ready ({readyItems.length})</h2>
            </div>
            <div className="space-y-3">
              {readyGroups.length === 0 && (
                <div className="text-center text-gray-500 py-8">No ready items</div>
              )}
              {readyGroups.map(group => (
                <div
                  key={group.orderNumber}
                  className="bg-[#272a30] rounded-xl border-2 border-green-500 hover:border-green-400 transition-all shadow-lg"
                >
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg">{group.tableNumber ? `Table ${group.tableNumber}` : group.orderType}</h3>
                      <p className="text-sm text-gray-400">{group.orderNumber} • {group.items[0]?.timeLabel}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {group.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                          <span>🍽️ {item.product_name}</span>
                          {item.notes && <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">{item.notes}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded">x{item.quantity}</span>
                          <button
                            onClick={() => updateOrderItemStatus(item.id!, 'served')}
                            className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-3 py-1 rounded font-bold transition"
                          >
                            Served ↩
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenPage;
