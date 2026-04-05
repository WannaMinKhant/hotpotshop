import { useState, useEffect, useMemo } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useProductStore } from '../stores/productsStore';
import { useCustomerStore } from '../stores/customerStore';
import { useI18nStore } from '../stores/i18nStore';

const ReportsPage = () => {
  const { orders, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { t } = useI18nStore();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
  }, [fetchOrders, fetchProducts, fetchCustomers]);

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      if (!o.created_at) return false;
      const d = new Date(o.created_at);
      if (period === 'today') return d.toDateString() === now.toDateString();
      if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return d >= monthAgo;
    });
  }, [orders, period]);

  // Revenue
  const totalRevenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0);
  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const avgOrderValue = completedOrders.length ? completedOrders.reduce((s, o) => s + o.total, 0) / completedOrders.length : 0;

  // Order type breakdown
  const orderTypeBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = { 'dine-in': { count: 0, revenue: 0 }, takeout: { count: 0, revenue: 0 }, delivery: { count: 0, revenue: 0 } };
    filteredOrders.forEach(o => {
      if (!counts[o.order_type]) counts[o.order_type] = { count: 0, revenue: 0 };
      counts[o.order_type].count++;
      counts[o.order_type].revenue += o.total || 0;
    });
    return counts;
  }, [filteredOrders]);

  // Category revenue (from order_items)
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, { qty: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
      o.items?.forEach(item => {
        if (!counts[item.product_name]) counts[item.product_name] = { qty: 0, revenue: 0 };
        counts[item.product_name].qty += item.quantity;
        counts[item.product_name].revenue += item.subtotal;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredOrders]);

  // Daily revenue for chart
  const dailyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.filter(o => o.status === 'completed').forEach(o => {
      const day = o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Unknown';
      map[day] = (map[day] || 0) + o.total;
    });
    return Object.entries(map).slice(-7);
  }, [filteredOrders]);

  const maxDaily = Math.max(...dailyRevenue.map(([, v]) => v), 1);

  // Payment method breakdown (from notes)
  const paymentBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.filter(o => o.status === 'completed').forEach(o => {
      const method = o.notes?.includes('card') ? 'Card' : o.notes?.includes('cash') ? 'Cash' : 'QR/Digital';
      counts[method] = (counts[method] || 0) + 1;
    });
    return Object.entries(counts);
  }, [filteredOrders]);

  // Low stock value
  const lowStockValue = products.filter(p => p.stock_quantity <= p.reorder_point).length;
  const inventoryValue = products.reduce((s, p) => s + (p.stock_quantity * (p.cost_price || p.price)), 0);

  const periodLabels = { today: t('reports.today'), week: t('reports.thisWeek'), month: t('reports.thisMonth') };
  const periodKeys: ('today' | 'week' | 'month')[] = ['today', 'week', 'month'];

  return (
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('reports.title')}</h1>
          <p className="text-gray-400 mt-1">{periodLabels[period]}</p>
        </div>
        <div className="flex bg-[#272a30] rounded-lg p-1">
          {periodKeys.map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-md transition ${period === p ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}>
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold">{t('reports.revenue')}</p>
          <p className="text-3xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-semibold">{t('reports.orders')}</p>
          <p className="text-3xl font-bold text-blue-400">{filteredOrders.length}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-semibold">{t('reports.avgOrder')}</p>
          <p className="text-3xl font-bold text-yellow-400">${avgOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500 rounded-xl p-4">
          <p className="text-purple-400 text-sm font-semibold">{t('reports.customers')}</p>
          <p className="text-3xl font-bold text-purple-400">{customers.length}</p>
        </div>
      </div>

      {/* Revenue Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Daily Revenue Chart */}
        <div className="lg:col-span-2 bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-4">Revenue Trend</h2>
          {dailyRevenue.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No data for this period</div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {dailyRevenue.map(([day, val]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-green-400 text-xs font-bold">${val.toFixed(0)}</span>
                  <div className="w-full bg-green-500/30 rounded-t transition-all hover:bg-green-500/50" style={{ height: `${(val / maxDaily) * 100}%` }} />
                  <span className="text-gray-500 text-xs">{day.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-4">Top Items</h2>
          {categoryBreakdown.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No data</div>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(([name, data], i) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xs">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{name}</p>
                    <p className="text-gray-500 text-xs">×{data.qty}</p>
                  </div>
                  <span className="text-green-400 font-bold text-sm">${data.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Types + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Order Types */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-4">Order Types</h2>
          <div className="space-y-3">
            {Object.entries(orderTypeBreakdown).map(([type, data]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type === 'dine-in' ? '🍽️' : type === 'takeout' ? '🥡' : '🚚'}</span>
                  <div>
                    <p className="text-white font-semibold capitalize">{type}</p>
                    <p className="text-gray-500 text-sm">{data.count} orders</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">${data.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-4">Payment Methods</h2>
          {paymentBreakdown.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No completed orders</div>
          ) : (
            <div className="space-y-3">
              {paymentBreakdown.map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method === 'Card' ? '💳' : method === 'Cash' ? '💵' : '📱'}</span>
                    <span className="text-white font-semibold">{method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{count}</p>
                    <p className="text-gray-500 text-sm">{filteredOrders.filter(o => o.status === 'completed').length ? Math.round((count / filteredOrders.filter(o => o.status === 'completed').length) * 100) : 0}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5">
        <h2 className="text-xl font-bold text-white mb-4">Inventory Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-white">{products.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Inventory Value</p>
            <p className="text-2xl font-bold text-green-400">${inventoryValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Low Stock Items</p>
            <p className="text-2xl font-bold text-red-400">{lowStockValue}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Customers</p>
            <p className="text-2xl font-bold text-blue-400">{customers.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
