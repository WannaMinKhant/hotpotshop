import { useState, useEffect } from 'react';
import { useOrderStore } from '../stores/orderStore';
import type { OrderStatusEnum } from '../types';

const OrdersPage = () => {
  const { orders, loading, error, fetchOrders, updateOrder, deleteOrder } = useOrderStore();
  
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filteredOrders = filterStatus ? orders.filter(o => o.status === filterStatus) : orders;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
    preparing: 'bg-blue-500/20 text-blue-400 border-blue-500',
    ready: 'bg-purple-500/20 text-purple-400 border-purple-500',
    served: 'bg-green-500/20 text-green-400 border-green-500',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500',
  };

    return (
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
      {/* ERROR STATE */}
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">{error}</div>}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">📋 Order Management</h1>
          <p className="text-gray-400 mt-1">Track and manage all orders</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#272a30] border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="served">Served</option>
            <option value="completed">Completed</option>
          </select>
          <span className="bg-yellow-500 text-black px-3 py-2 rounded-lg font-bold">
            {filteredOrders.length} orders
          </span>
        </div>
      </div>

            {/* LOADING/EMPTY STATE */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No orders found</div>
        ) : (filteredOrders.map(order => (
          <div key={order.id} className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden transition-all">
                        <div
              onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id!)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#2f333a] transition"
            >
              <div className="flex items-center gap-4">
                <span className="font-bold text-yellow-400 text-lg">{order.order_number}</span>
                <div>
                  <p className="text-white font-semibold">{order.table_number ? `Table ${order.table_number}` : order.order_type}</p>
                  <p className="text-gray-400 text-sm">{order.customer_name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status]}`}>
                  {order.status.toUpperCase()}
                </span>
                <span className="text-gray-400 text-sm">{order.created_at ? new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                <span className="text-gray-400 text-sm capitalize">{order.order_type}</span>
                <span className="text-green-400 font-bold text-lg">${order.total.toFixed(2)}</span>
                <span className="text-gray-500">{expandedOrderId === order.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedOrderId === order.id && (
              <div className="p-4 border-t border-gray-700 bg-[#1f2329]">
                <h3 className="font-bold text-white mb-3">Order Items:</h3>
                <div className="space-y-2 mb-4">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <span>{item.product_name}</span>
                        <span className="text-gray-400">×{item.quantity}</span>
                      </div>
                      <span className="text-green-400">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                  <span className="text-white font-bold text-lg">Total</span>
                  <span className="text-green-400 font-bold text-xl">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {order.status === 'pending' && (
                    <button onClick={() => updateOrder(order.id!, { status: 'preparing' })} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-400">▶ Start Preparing</button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateOrder(order.id!, { status: 'ready' })} className="bg-purple-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-400">✅ Mark Ready</button>
                  )}
                  {order.status === 'ready' && (
                    <button onClick={() => updateOrder(order.id!, { status: 'served' })} className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400">🍽 Mark Served</button>
                  )}
                  {order.status === 'served' && (
                    <button onClick={() => updateOrder(order.id!, { status: 'completed' })} className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-400">🏁 Complete Order</button>
                  )}
                  <button onClick={() => setConfirmDeleteId(order.id!)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-500">🗑 Delete</button>
                </div>
              </div>
            )}
          </div>
        )))}
      </div>

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-red-600 p-6 w-80 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-white font-bold text-lg mb-2">Delete Order?</p>
            <p className="text-gray-400 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => { deleteOrder(confirmDeleteId); setConfirmDeleteId(null); }} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-500">Delete</button>
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
