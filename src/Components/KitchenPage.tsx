import { useEffect, useMemo, useState } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useNotificationStore } from '../stores/notificationStore';
import type { Order, OrderItem } from '../types';

type EnrichedOrder = Order & { minsAgo: number; timeLabel: string; isUrgent: boolean };

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
  const { orders, loading, error, fetchOrders, updateOrder } = useOrderStore();
  const { kitchenCount } = useNotificationStore();
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

  const pendingOrders = enrichedOrders.filter(o => o.status === 'pending');
  const cookingOrders = enrichedOrders.filter(o => o.status === 'preparing');
  const readyOrders = enrichedOrders.filter(o => o.status === 'ready');

  return (
    <div className="h-screen bg-[#1e2128] p-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">🍲 Kitchen Display</h1>
        <p className="text-gray-400 mt-1">Manage and track all kitchen orders</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-yellow-400 text-sm font-semibold">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{loading ? '...' : pendingOrders.length}</p>
          </div>
          <span className="text-3xl">⏳</span>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-sm font-semibold">Cooking</p>
            <p className="text-3xl font-bold text-blue-400">{cookingOrders.length}</p>
          </div>
          <span className="text-3xl">🔥</span>
        </div>
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-green-400 text-sm font-semibold">Ready</p>
            <p className="text-3xl font-bold text-green-400">{readyOrders.length}</p>
          </div>
          <span className="text-3xl">✅</span>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Loading kitchen orders...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400 text-xl">⏳</span>
              <h2 className="text-xl font-bold text-yellow-400">Pending ({pendingOrders.length})</h2>
            </div>
            <div className="space-y-3">
              {pendingOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">No pending orders</div>
              )}
              {pendingOrders.map(order => (
                <div
                  key={order.id}
                  className={`bg-[#272a30] rounded-xl border-2 ${order.isUrgent ? 'border-red-500' : 'border-yellow-500/50'}
                    hover:border-yellow-500 transition-all shadow-lg`}
                >
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg">{order.table_number ? `Table ${order.table_number}` : order.order_type}</h3>
                      <p className="text-sm text-gray-400">{order.order_number} • {order.timeLabel}</p>
                    </div>
                    {order.isUrgent && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">URGENT</span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    {order.items?.map((item: OrderItem, i: number) => (
                      <div key={i} className="flex justify-between items-center text-white">
                        <span>🍽️ {item.product_name}</span>
                        <span className="font-bold text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-700">
                    <button
                      onClick={() => updateOrder(order.id!, { status: 'preparing' })}
                      className="w-full bg-blue-500 hover:bg-blue-400 text-white py-2 rounded-lg font-bold transition"
                    >
                      Start Cooking →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-400 text-xl">🔥</span>
              <h2 className="text-xl font-bold text-blue-400">Cooking ({cookingOrders.length})</h2>
            </div>
            <div className="space-y-3">
              {cookingOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">No cooking orders</div>
              )}
              {cookingOrders.map(order => (
                <div
                  key={order.id}
                  className={`bg-[#272a30] rounded-xl border-2 ${order.isUrgent ? 'border-red-500' : 'border-blue-500/50'}
                    hover:border-blue-500 transition-all shadow-lg`}
                >
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg">{order.table_number ? `Table ${order.table_number}` : order.order_type}</h3>
                      <p className="text-sm text-gray-400">{order.order_number} • {order.timeLabel}</p>
                    </div>
                    {order.isUrgent && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">URGENT</span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    {order.items?.map((item: OrderItem, i: number) => (
                      <div key={i} className="flex justify-between items-center text-white">
                        <span>🍽️ {item.product_name}</span>
                        {item.notes && <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">{item.notes}</span>}
                        <span className="font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-700">
                    <button
                      onClick={() => updateOrder(order.id!, { status: 'ready' })}
                      className="w-full bg-green-500 hover:bg-green-400 text-black py-2 rounded-lg font-bold transition"
                    >
                      Mark Ready ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ready Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-400 text-xl">✅</span>
              <h2 className="text-xl font-bold text-green-400">Ready ({readyOrders.length})</h2>
            </div>
            <div className="space-y-3">
              {readyOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">No ready orders</div>
              )}
              {readyOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-[#272a30] rounded-xl border-2 border-green-500 hover:border-green-400 transition-all shadow-lg"
                >
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg">{order.table_number ? `Table ${order.table_number}` : order.order_type}</h3>
                      <p className="text-sm text-gray-400">{order.order_number} • {order.timeLabel}</p>
                    </div>
                    {order.isUrgent && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">URGENT</span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    {order.items?.map((item: OrderItem, i: number) => (
                      <div key={i} className="flex justify-between items-center text-white">
                        <span>🍽️ {item.product_name}</span>
                        <span className="font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-700">
                    <button
                      onClick={() => updateOrder(order.id!, { status: 'served' })}
                      className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg font-bold transition"
                    >
                      Delivered ↩
                    </button>
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
