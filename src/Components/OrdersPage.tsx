import { useState, useEffect, useMemo } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useNotificationStore } from '../stores/notificationStore';
import ReceiptSlip, { type ReceiptData } from './ReceiptSlip';

type OrderView = 'active' | 'today' | 'history';

const OrdersPage = () => {
  const { orders, loading, error, fetchOrders, updateOrder, removeOrderItem } = useOrderStore();
  const { ordersCount } = useNotificationStore();

  const [view, setView] = useState<OrderView>('active');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);

  useEffect(() => { fetchOrders(); }, [fetchOrders, ordersCount]);

  const today = new Date().toDateString();

  // Group orders by time
  const activeOrders = useMemo(() =>
    orders.filter(o => ['pending', 'preparing', 'ready', 'served'].includes(o.status))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
    [orders]
  );

  const todayOrders = useMemo(() =>
    orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === today)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
    [orders, today]
  );

  const historyOrders = useMemo(() =>
    orders.filter(o => o.created_at && new Date(o.created_at).toDateString() !== today)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
    [orders, today]
  );

  // Filter by search
  const applySearch = (list: typeof orders) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(o =>
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.table_number?.toString().includes(q) ||
      o.order_type?.toLowerCase().includes(q)
    );
  };

  const displayOrders = view === 'active' ? applySearch(activeOrders)
    : view === 'today' ? applySearch(todayOrders)
    : applySearch(historyOrders);

  // Group orders by type (Dine-in/Table, Takeout, Delivery)
  type OrderGroup = { label: string; icon: string; orders: typeof orders; color: string };

  const groupOrdersByType = (ordersList: typeof orders): OrderGroup[] => {
    const dineIn = ordersList.filter(o => o.order_type === 'dine-in');
    const takeout = ordersList.filter(o => o.order_type === 'takeout');
    const delivery = ordersList.filter(o => o.order_type === 'delivery');

    const groups: OrderGroup[] = [];
    if (dineIn.length > 0) groups.push({ label: 'Dine-in Tables', icon: '🍽️', orders: dineIn, color: 'text-blue-400' });
    if (takeout.length > 0) groups.push({ label: 'Takeout', icon: '🥡', orders: takeout, color: 'text-orange-400' });
    if (delivery.length > 0) groups.push({ label: 'Delivery', icon: '🚚', orders: delivery, color: 'text-purple-400' });
    return groups;
  };

  const orderGroups = groupOrdersByType(displayOrders);

  // Total counts per type for the view
  const totalCounts = {
    dineIn: displayOrders.filter(o => o.order_type === 'dine-in').length,
    takeout: displayOrders.filter(o => o.order_type === 'takeout').length,
    delivery: displayOrders.filter(o => o.order_type === 'delivery').length,
  };

  const handlePayAndComplete = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setPaymentLoading(true);

    const receipt: ReceiptData = {
      orderNumber: order.order_number || `ORD-${orderId}`,
      items: (order.items || []).map(item => ({
        name: item.product_name,
        qty: item.quantity,
        price: item.unit_price,
        subtotal: item.subtotal,
      })),
      subtotal: order.total / 1.1,
      tax: order.total - (order.total / 1.1),
      total: order.total,
      paymentMethod: selectedPaymentMethod,
      tableNumber: order.table_number || undefined,
      orderType: order.order_type,
      timestamp: new Date().toLocaleString(),
    };

    // Simulate server request
    await new Promise(resolve => setTimeout(resolve, 800));
    updateOrder(orderId, { status: 'completed' });

    setPaymentLoading(false);
    setPaymentOrderId(null);
    setSelectedPaymentMethod('');
    setReceiptData(receipt);
    setShowReceipt(true);
  };

  const handleRemoveItem = async (itemId: number, orderId: number, itemName: string) => {
    if (!confirm(`Remove "${itemName}" from this order?`)) return;

    setRemovingItemId(itemId);
    try {
      await removeOrderItem(itemId, orderId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setRemovingItemId(null);
    }
  };

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    pending: { label: 'Pending', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
    preparing: { label: 'Cooking', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
    ready: { label: 'Ready', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
    served: { label: 'Served', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' },
    completed: { label: 'Completed', bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const views: { id: OrderView; label: string; icon: string; count: number }[] = [
    { id: 'active', label: 'Active Orders', icon: '🔥', count: activeOrders.length },
    { id: 'today', label: 'Today', icon: '📅', count: todayOrders.length },
    { id: 'history', label: 'History', icon: '📜', count: historyOrders.length },
  ];

  return (
    <div className="p-6 bg-[#1e2128] min-h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">📋 Orders</h1>
            <p className="text-gray-400 mt-1">Track, manage, and complete orders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🔍 Search orders..."
                className="pl-9 pr-4 py-2 rounded-lg bg-[#272a30] border border-gray-600 text-white text-sm w-56"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs">✕</button>
              )}
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 bg-[#272a30] rounded-xl p-1.5">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => { setView(v.id); setExpandedOrderId(null); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                view === v.id
                  ? 'bg-yellow-500 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#2f333a]'
              }`}
            >
              <span>{v.icon}</span>
              <span className="hidden sm:inline">{v.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                view === v.id ? 'bg-black/20 text-black' : v.count > 0 ? 'bg-gray-600 text-gray-300' : 'bg-gray-700 text-gray-500'
              }`}>
                {v.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
          <p className="font-semibold">⚠️ {error}</p>
          <button onClick={fetchOrders} className="mt-1 text-sm underline">Retry</button>
        </div>
      )}

      {/* Active Stats Bar */}
      {view === 'active' && activeOrders.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {(['pending', 'preparing', 'ready', 'served'] as const).map(status => {
            const count = activeOrders.filter(o => o.status === status).length;
            const cfg = statusConfig[status];
            return (
              <div key={status} className={`${cfg.bg} border ${cfg.border} rounded-lg p-3 text-center`}>
                <p className={`text-lg font-bold ${cfg.text}`}>{count}</p>
                <p className={`text-[10px] font-semibold ${cfg.text} uppercase`}>{cfg.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-3xl mb-2">⏳</p>
          <p>Loading orders...</p>
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-5xl mb-3">{view === 'active' ? '✅' : view === 'today' ? '📅' : '📜'}</p>
          <p className="text-lg font-semibold">No {view === 'active' ? 'active' : view === 'today' ? "today's" : 'historical'} orders</p>
          <p className="text-sm mt-1">{searchQuery ? 'Try a different search' : 'Orders will appear here'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Type count badges */}
          <div className="flex gap-3 flex-wrap">
            {totalCounts.dineIn > 0 && (
              <span className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                🍽️ Dine-in: {totalCounts.dineIn}
              </span>
            )}
            {totalCounts.takeout > 0 && (
              <span className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                🥡 Takeout: {totalCounts.takeout}
              </span>
            )}
            {totalCounts.delivery > 0 && (
              <span className="bg-purple-500/20 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                🚚 Delivery: {totalCounts.delivery}
              </span>
            )}
          </div>

          {/* Grouped Sections */}
          {orderGroups.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No orders match your filters</div>
          ) : (
            orderGroups.map(group => (
              <div key={group.label}>
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{group.icon}</span>
                  <h3 className={`text-lg font-bold ${group.color}`}>{group.label}</h3>
                  <span className="text-gray-500 text-sm">({group.orders.length} order{group.orders.length !== 1 ? 's' : ''})</span>
                  <div className="flex-1 border-t border-gray-700" />
                </div>

                {/* Time sub-groups */}
                {(() => {
                  // Sub-group by time period
                  const now = new Date();
                  const timeGroups: { label: string; orders: typeof orders }[] = [];

                  const lastHour = new Date(now.getTime() - 60 * 60000);
                  const last3Hours = new Date(now.getTime() - 3 * 60 * 60000);

                  const recent = group.orders.filter(o => o.created_at && new Date(o.created_at) >= lastHour);
                  const recent3h = group.orders.filter(o => {
                    if (!o.created_at) return false;
                    const d = new Date(o.created_at);
                    return d >= last3Hours && d < lastHour;
                  });
                  const older = group.orders.filter(o => o.created_at && new Date(o.created_at) < last3Hours);

                  if (recent.length > 0) timeGroups.push({ label: 'Last Hour', orders: recent });
                  if (recent3h.length > 0) timeGroups.push({ label: '1–3 Hours Ago', orders: recent3h });
                  if (older.length > 0) timeGroups.push({ label: 'Older', orders: older });

                  return timeGroups.map(tg => (
                    <div key={tg.label} className="mb-4">
                      {timeGroups.length > 1 && (
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">{tg.label}</p>
                      )}
                      <div className="space-y-2">
                        {tg.orders.map(order => {
                          const cfg = statusConfig[order.status] || statusConfig.pending;
                          const isActive = ['pending', 'preparing', 'ready', 'served'].includes(order.status);
                          const isExpanded = expandedOrderId === order.id;

                          return (
                            <div
                              key={order.id}
                              className={`bg-[#272a30] rounded-xl border overflow-hidden transition-all duration-200 ${
                                isExpanded ? `border-yellow-500/50 shadow-lg shadow-yellow-500/5` : 'border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              {/* Order Row */}
                              <div
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id!)}
                                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-[#2f333a] transition"
                              >
                                {/* Table/Detail + Type */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xl">{group.icon}</span>
                                    {order.order_type === 'dine-in' && order.table_number && (
                                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-xs font-bold">
                                        T{order.table_number}
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-yellow-400 text-sm truncate">{order.order_number}</p>
                                    <p className="text-gray-400 text-xs truncate">
                                      {order.customer_name || (order.order_type === 'dine-in' ? `Table ${order.table_number || '—'}` : order.order_type)}
                                    </p>
                                  </div>
                                </div>

                                {/* Status */}
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border} shrink-0`}>
                                  {cfg.label}
                                </span>

                                {/* Time */}
                                <div className="text-right shrink-0">
                                  <p className="text-gray-400 text-xs">{order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                                  <p className="text-gray-500 text-[10px]">{order.created_at ? formatTime(order.created_at) : ''}</p>
                                </div>

                                {/* Total */}
                                <p className="text-green-400 font-bold text-base shrink-0">${order.total.toFixed(2)}</p>

                                {/* Expand Arrow */}
                                <span className="text-gray-500 text-sm shrink-0 transition-transform duration-200">
                                  {isExpanded ? '▲' : '▼'}
                                </span>
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="px-4 pb-4 border-t border-gray-700 bg-[#1f2329]">
                                  {/* Items */}
                                  <div className="mt-3 mb-3">
                                    <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Order Items</p>
                                    <div className="space-y-1.5">
                                      {(order.items || []).map((item, i) => {
                                        const itemStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
                                          pending: { label: '⏳', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
                                          preparing: { label: '🔥', bg: 'bg-blue-500/20', text: 'text-blue-400' },
                                          ready: { label: '✅', bg: 'bg-green-500/20', text: 'text-green-400' },
                                          served: { label: '🍽', bg: 'bg-gray-500/20', text: 'text-gray-400' },
                                        };
                                        const itemStatus = item.status ? itemStatusConfig[item.status] : itemStatusConfig.pending;
                                        const canRemove = item.status === 'pending';
                                        return (
                                          <div key={item.id || i} className="flex items-center justify-between bg-[#272a30] rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                              <span className="text-sm font-bold text-yellow-400 shrink-0">×{item.quantity}</span>
                                              <span className="text-white text-sm truncate">{item.product_name}</span>
                                              {item.notes && <span className="text-purple-400 text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded shrink-0">{item.notes}</span>}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              {canRemove && (
                                                <button
                                                  onClick={() => handleRemoveItem(item.id!, order.id!, item.product_name)}
                                                  disabled={removingItemId === item.id}
                                                  className={`text-xs px-2 py-1 rounded font-semibold transition ${
                                                    removingItemId === item.id
                                                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                                  }`}
                                                  title="Remove item from order"
                                                >
                                                  {removingItemId === item.id ? '⏳' : '✕'}
                                                </button>
                                              )}
                                              <span className={`${itemStatus.text} text-xs`} title={item.status}>{itemStatus.label}</span>
                                              <span className="text-green-400 text-sm font-semibold ml-2">${item.subtotal.toFixed(2)}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Totals */}
                                  <div className="flex justify-between items-center py-2 border-t border-gray-700">
                                    <div>
                                      <p className="text-gray-400 text-xs">Subtotal: ${(order.total / 1.1).toFixed(2)} · Tax: ${(order.total - order.total / 1.1).toFixed(2)}</p>
                                    </div>
                                    <span className="text-green-400 font-bold text-xl">${order.total.toFixed(2)}</span>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 mt-3 flex-wrap">
                                    {order.status === 'served' && (
                                      <button onClick={() => setPaymentOrderId(order.id!)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-bold">💰 Pay & Complete</button>
                                    )}
                                    {order.status === 'completed' && (
                                      <button
                                        onClick={() => {
                                          const r: ReceiptData = {
                                            orderNumber: order.order_number || '',
                                            items: (order.items || []).map(item => ({ name: item.product_name, qty: item.quantity, price: item.unit_price, subtotal: item.subtotal })),
                                            subtotal: order.total / 1.1,
                                            tax: order.total - order.total / 1.1,
                                            total: order.total,
                                            paymentMethod: order.payment_method || 'cash',
                                            tableNumber: order.table_number || undefined,
                                            orderType: order.order_type,
                                            timestamp: order.created_at ? new Date(order.created_at).toLocaleString() : '',
                                          };
                                          setReceiptData(r);
                                          setShowReceipt(true);
                                        }}
                                        className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-bold"
                                      >
                                        🧾 View Receipt
                                      </button>
                                    )}
                                    {isActive && (
                                      <button onClick={() => setConfirmDeleteId(order.id!)} className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-bold ml-auto">🗑 Cancel</button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-red-600 p-6 w-80 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-white font-bold text-lg mb-2">Cancel Order?</p>
            <p className="text-gray-400 text-sm mb-4">This will mark the order as cancelled.</p>
            <div className="flex gap-2">
              <button onClick={() => { updateOrder(confirmDeleteId, { status: 'cancelled' }); setConfirmDeleteId(null); }} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-500">Cancel Order</button>
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500">Go Back</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Panel — Right Side */}
      {paymentOrderId && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => { if (!paymentLoading) { setPaymentOrderId(null); setSelectedPaymentMethod(''); } }}
          />
          {/* Right Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#272a30] border-l border-gray-700 z-50 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-700 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">💳 Payment</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {(() => { const o = orders.find(x => x.id === paymentOrderId); return o?.order_number || ''; })()}
                </p>
              </div>
              {!paymentLoading && (
                <button
                  onClick={() => { setPaymentOrderId(null); setSelectedPaymentMethod(''); }}
                  className="w-8 h-8 rounded-lg bg-[#1e2128] hover:bg-[#2f333a] flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {paymentLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-white font-bold text-lg">Processing Payment...</p>
                  <p className="text-gray-400 text-sm mt-1">Please wait while we complete your order</p>
                </div>
              ) : (
                <>
                  {/* Order Summary */}
                  {(() => {
                    const o = orders.find(x => x.id === paymentOrderId);
                    if (!o) return null;
                    return (
                      <div className="bg-[#1f2329] rounded-xl border border-gray-700 p-4 mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-yellow-400 font-bold text-sm">{o.order_number}</span>
                          <span className="text-green-400 font-bold text-xl">${o.total.toFixed(2)}</span>
                        </div>
                        <div className="space-y-1">
                          {(o.items || []).map((item, i) => (
                            <div key={item.id || i} className="flex justify-between text-sm">
                              <span className="text-gray-300 truncate">×{item.quantity} {item.product_name}</span>
                              <span className="text-gray-400 ml-2">${item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment Methods */}
                  <p className="text-gray-400 text-sm mb-3">Select payment method:</p>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                      onClick={() => setSelectedPaymentMethod('card')}
                      disabled={paymentLoading}
                      className={`p-4 rounded-xl font-bold text-center transition-all ${
                        selectedPaymentMethod === 'card'
                          ? 'bg-blue-500 text-white ring-2 ring-blue-400 shadow-lg shadow-blue-500/20 scale-105'
                          : 'bg-[#1e2128] text-gray-300 hover:bg-[#2f333a]'
                      }`}
                    >
                      <span className="text-2xl block mb-1">💳</span>
                      <span className="text-xs">Card</span>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod('cash')}
                      disabled={paymentLoading}
                      className={`p-4 rounded-xl font-bold text-center transition-all ${
                        selectedPaymentMethod === 'cash'
                          ? 'bg-green-500 text-white ring-2 ring-green-400 shadow-lg shadow-green-500/20 scale-105'
                          : 'bg-[#1e2128] text-gray-300 hover:bg-[#2f333a]'
                      }`}
                    >
                      <span className="text-2xl block mb-1">💵</span>
                      <span className="text-xs">Cash</span>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod('qr')}
                      disabled={paymentLoading}
                      className={`p-4 rounded-xl font-bold text-center transition-all ${
                        selectedPaymentMethod === 'qr'
                          ? 'bg-purple-500 text-white ring-2 ring-purple-400 shadow-lg shadow-purple-500/20 scale-105'
                          : 'bg-[#1e2128] text-gray-300 hover:bg-[#2f333a]'
                      }`}
                    >
                      <span className="text-2xl block mb-1">📱</span>
                      <span className="text-xs">QR</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            {!paymentLoading && (
              <div className="p-5 border-t border-gray-700 shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePayAndComplete(paymentOrderId)}
                    disabled={!selectedPaymentMethod}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      selectedPaymentMethod
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300 shadow-lg shadow-yellow-500/20'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Complete Payment
                  </button>
                  <button
                    onClick={() => { setPaymentOrderId(null); setSelectedPaymentMethod(''); }}
                    className="px-5 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-bold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Receipt Slip */}
      {showReceipt && receiptData && (
        <ReceiptSlip receipt={receiptData} onClose={() => { setShowReceipt(false); setReceiptData(null); }} />
      )}
    </div>
  );
};

export default OrdersPage;
