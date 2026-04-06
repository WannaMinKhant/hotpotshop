import { useState, useEffect, useMemo } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useProductStore } from '../stores/productsStore';
import { useCustomerStore } from '../stores/customerStore';
import { useI18nStore } from '../stores/i18nStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#facc15', '#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ef4444', '#14b8a6', '#ec4899'];

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

  // 7-Day Revenue Data (always show last 7 days)
  const sevenDayRevenue = useMemo(() => {
    const data: { day: string; revenue: number; orders: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toDateString();

      const dayOrders = orders.filter(o => {
        if (!o.created_at || o.status !== 'completed') return false;
        return new Date(o.created_at).toDateString() === dateStr;
      });

      const dayRevenue = dayOrders.reduce((s, o) => s + (o.total || 0), 0);
      data.push({ day: dayStr, revenue: dayRevenue, orders: dayOrders.length });
    }

    return data;
  }, [orders]);

  // Top Selling Items (by quantity sold)
  const topItems = useMemo(() => {
    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};

    filteredOrders.forEach(o => {
      o.items?.forEach(item => {
        if (!itemMap[item.product_name]) {
          itemMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
        }
        itemMap[item.product_name].qty += item.quantity;
        itemMap[item.product_name].revenue += item.subtotal || 0;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map(item => ({
        name: item.name.length > 12 ? item.name.slice(0, 10) + '...' : item.name,
        fullName: item.name,
        qty: item.qty,
        revenue: item.revenue,
      }));
  }, [filteredOrders]);

  // Pie chart data
  const pieData = useMemo(() => {
    return topItems.map(item => ({
      name: item.name,
      value: item.revenue,
      qty: item.qty,
      fullName: item.fullName,
    }));
  }, [topItems]);

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

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    completedOrders.forEach(o => {
      const method = o.payment_method || 'cash';
      const label = method === 'card' ? '💳 Card' : method === 'qr' ? '📱 QR' : '💵 Cash';
      if (!counts[label]) counts[label] = { count: 0, revenue: 0 };
      counts[label].count++;
      counts[label].revenue += o.total || 0;
    });
    return Object.entries(counts);
  }, [completedOrders]);

  // Low stock value
  const lowStockValue = products.filter(p => p.stock_quantity <= p.reorder_point).length;
  const inventoryValue = products.reduce((s, p) => s + (p.stock_quantity * (p.cost_price || p.price)), 0);

  const periodLabels = { today: t('reports.today'), week: t('reports.thisWeek'), month: t('reports.thisMonth') };
  const periodKeys: ('today' | 'week' | 'month')[] = ['today', 'week', 'month'];

  return (
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
      {/* Header */}
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

      {/* Revenue Bar Chart + Top Items Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 7-Day Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-2">📈 7-Day Revenue</h2>
          <p className="text-gray-500 text-sm mb-4">Completed orders revenue per day</p>
          {sevenDayRevenue.every(d => d.revenue === 0) ? (
            <div className="text-center text-gray-400 py-12">No revenue data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sevenDayRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                    if (name === 'orders') return [value, 'Orders'];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ color: '#facc15', fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Items Pie Chart */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-2">🏆 Top Items</h2>
          <p className="text-gray-500 text-sm mb-4">By revenue share</p>
          {pieData.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No sales data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${Number(value).toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const item = pieData.find(d => d.name === value);
                      return `${value} (×${item?.qty || 0})`;
                    }}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Revenue List */}
              <div className="mt-4 space-y-2">
                {topItems.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs truncate" title={item.fullName}>{item.name}</p>
                      <p className="text-gray-500 text-[10px]">×{item.qty}</p>
                    </div>
                    <span className="text-green-400 font-bold text-xs">${item.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
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
              {paymentBreakdown.map(([method, data]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.includes('Card') ? '💳' : method.includes('QR') ? '📱' : '💵'}</span>
                    <span className="text-white font-semibold">{method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{data.count} · ${data.revenue.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">{completedOrders.length ? Math.round((data.count / completedOrders.length) * 100) : 0}%</p>
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
