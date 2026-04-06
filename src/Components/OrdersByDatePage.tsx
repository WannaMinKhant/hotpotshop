import { useState, useEffect, useMemo } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useStockMovementStore } from '../stores/stockMovementStore';

type TabType = 'orders' | 'purchases';

const OrdersByDatePage = () => {
  const { orders, loading: ordersLoading, fetchOrders } = useOrderStore();
  const { movements, loading: purchasesLoading, fetchMovements } = useStockMovementStore();

  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    fetchOrders();
    fetchMovements();
  }, [fetchOrders, fetchMovements]);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(o => {
        if (!o.created_at) return false;
        return new Date(o.created_at) >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(o => {
        if (!o.created_at) return false;
        return new Date(o.created_at) <= end;
      });
    }

    // Sort by date descending (newest first)
    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [orders, startDate, endDate]);

  // Filter purchases (stock movements with type 'purchase')
  const filteredPurchases = useMemo(() => {
    let filtered = movements.filter(m => m.movement_type === 'purchase');

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(m => {
        if (!m.created_at) return false;
        return new Date(m.created_at) >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => {
        if (!m.created_at) return false;
        return new Date(m.created_at) <= end;
      });
    }

    // Sort by date descending (newest first)
    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [movements, startDate, endDate]);

  // Pagination
  const currentList = activeTab === 'orders' ? filteredOrders : filteredPurchases;
  const totalPages = Math.ceil(currentList.length / rowsPerPage);
  const paginatedData: unknown[] = currentList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Summary calculations
  const ordersSummary = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedCount = filteredOrders.filter(o => o.status === 'completed').length;
    const cancelledCount = filteredOrders.filter(o => o.status === 'cancelled').length;
    return { totalRevenue, completedCount, cancelledCount, totalCount: filteredOrders.length };
  }, [filteredOrders]);

  const purchasesSummary = useMemo(() => {
    const totalCost = filteredPurchases.reduce((sum, p) => sum + (p.total_cost || 0), 0);
    const totalItems = filteredPurchases.reduce((sum, p) => sum + (p.quantity || 0), 0);
    return { totalCost, totalItems, totalCount: filteredPurchases.length };
  }, [filteredPurchases]);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
    preparing: 'bg-blue-500/20 text-blue-400 border-blue-500',
    ready: 'bg-purple-500/20 text-purple-400 border-purple-500',
    served: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
    completed: 'bg-green-500/20 text-green-400 border-green-500',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500',
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 bg-[#1e2128] min-h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">📅 Orders & Purchases by Date</h1>
        <p className="text-gray-400 mt-1">View orders and stock purchases within date ranges</p>
      </div>

      {/* Date Filters */}
      <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-gray-400 text-xs mb-1 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 rounded-xl bg-[#1e2128] border border-gray-600 text-white outline-none focus:border-yellow-500 transition"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-400 text-xs mb-1 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 rounded-xl bg-[#1e2128] border border-gray-600 text-white outline-none focus:border-yellow-500 transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition"
            >
              🔄 Clear Dates
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {activeTab === 'orders' ? (
          <>
            <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
              <p className="text-green-400 text-sm font-semibold">💰 Total Revenue</p>
              <p className="text-3xl font-bold text-green-400">${ordersSummary.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
              <p className="text-blue-400 text-sm font-semibold">📋 Total Orders</p>
              <p className="text-3xl font-bold text-blue-400">{ordersSummary.totalCount}</p>
            </div>
            <div className="bg-purple-500/20 border border-purple-500 rounded-xl p-4">
              <p className="text-purple-400 text-sm font-semibold">✅ Completed</p>
              <p className="text-3xl font-bold text-purple-400">{ordersSummary.completedCount}</p>
            </div>
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-4">
              <p className="text-red-400 text-sm font-semibold">❌ Cancelled</p>
              <p className="text-3xl font-bold text-red-400">{ordersSummary.cancelledCount}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
              <p className="text-green-400 text-sm font-semibold">💰 Total Cost</p>
              <p className="text-3xl font-bold text-green-400">${purchasesSummary.totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
              <p className="text-blue-400 text-sm font-semibold">📦 Total Items</p>
              <p className="text-3xl font-bold text-blue-400">{purchasesSummary.totalItems.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
              <p className="text-yellow-400 text-sm font-semibold">📋 Purchases</p>
              <p className="text-3xl font-bold text-yellow-400">{purchasesSummary.totalCount}</p>
            </div>
            <div className="bg-gray-500/20 border border-gray-500 rounded-xl p-4">
              <p className="text-gray-400 text-sm font-semibold">📊 Avg Cost</p>
              <p className="text-3xl font-bold text-gray-400">
                ${purchasesSummary.totalCount > 0 ? (purchasesSummary.totalCost / purchasesSummary.totalCount).toFixed(2) : '0.00'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('orders'); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-xl font-bold transition ${
            activeTab === 'orders'
              ? 'bg-yellow-500 text-black'
              : 'bg-[#272a30] text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          📋 Orders ({filteredOrders.length})
        </button>
        <button
          onClick={() => { setActiveTab('purchases'); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-xl font-bold transition ${
            activeTab === 'purchases'
              ? 'bg-yellow-500 text-black'
              : 'bg-[#272a30] text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          📦 Purchases ({filteredPurchases.length})
        </button>
      </div>

      {/* Loading State */}
      {(ordersLoading || purchasesLoading) && currentList.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Loading data...</div>
      ) : (
        <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          {/* ORDERS TABLE */}
          {activeTab === 'orders' && (
            <>
              <table className="w-full">
                <thead className="border-b border-gray-700 text-left text-gray-400 text-sm">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">No orders found for this date range</td>
                    </tr>
                  ) : (
                    paginatedData.map((order: unknown) => {
                      const o = order as typeof filteredOrders[0];
                      return (
                      <tr key={o.id} className="hover:bg-[#2f333a] transition">
                        <td className="p-4 text-yellow-400 font-semibold">{o.order_number}</td>
                        <td className="p-4 text-white">{o.customer_name || 'Walk-in'}</td>
                        <td className="p-4 text-gray-300 capitalize">
                          {o.order_type === 'dine-in' ? `🍽️ Table ${o.table_number || '-'}` :
                           o.order_type === 'takeout' ? '🥡 Takeout' : '🚚 Delivery'}
                        </td>
                        <td className="p-4 text-white text-center">{o.items?.length || 0}</td>
                        <td className="p-4 text-gray-300">{formatDateTime(o.created_at)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[o.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4 text-right text-green-400 font-bold">${(o.total || 0).toFixed(2)}</td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* PURCHASES TABLE */}
          {activeTab === 'purchases' && (
            <>
              <table className="w-full">
                <thead className="border-b border-gray-700 text-left text-gray-400 text-sm">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Cost/Unit</th>
                    <th className="p-4">Total Cost</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">No purchases found for this date range</td>
                    </tr>
                  ) : (
                    paginatedData.map((purchase: unknown) => {
                      const p = purchase as typeof filteredPurchases[0];
                      return (
                      <tr key={p.id} className="hover:bg-[#2f333a] transition">
                        <td className="p-4 text-white font-semibold">{p.product_name || 'Product'}</td>
                        <td className="p-4 text-gray-300">{p.reference || '—'}</td>
                        <td className="p-4">
                          <span className="text-blue-400 font-bold">{p.quantity}</span>
                          <span className="text-gray-400 text-sm ml-1">{p.unit}</span>
                        </td>
                        <td className="p-4 text-gray-300">${(p.cost_per_unit || 0).toFixed(2)}</td>
                        <td className="p-4 text-green-400 font-bold">${(p.total_cost || 0).toFixed(2)}</td>
                        <td className="p-4 text-gray-400 text-sm max-w-40 truncate">{p.notes || '—'}</td>
                        <td className="p-4 text-gray-300">{formatDateTime(p.created_at)}</td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, currentList.length)} of {currentList.length} records
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-md font-semibold text-sm transition ${
                    currentPage === 1
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  // Show first, last, and pages around current
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-md font-semibold text-sm transition ${
                        currentPage === page
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-md font-semibold text-sm transition ${
                    currentPage === totalPages
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersByDatePage;
