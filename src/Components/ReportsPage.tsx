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
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [orderTab, setOrderTab] = useState<'completed' | 'cancelled'>('completed');

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

  // Top Selling Items (by quantity sold) - Limited to 5
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
      .slice(0, 5)
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

  // Low stock value
  const lowStockValue = products.filter(p => p.stock_quantity <= p.reorder_point).length;
  const inventoryValue = products.reduce((s, p) => s + (p.stock_quantity * (p.cost_price || p.price)), 0);

  // Profit/Loss Calculation
  const profitLoss = useMemo(() => {
    const totalRevenue = filteredOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0);
    
    // Calculate total cost from order items
    let totalCost = 0;
    filteredOrders.filter(o => o.status === 'completed').forEach(o => {
      o.items?.forEach(item => {
        // Find the product to get cost price
        const product = products.find(p => p.id === item.product_id);
        const costPrice = product?.cost_price || 0;
        totalCost += costPrice * item.quantity;
      });
    });

    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      revenue: totalRevenue,
      cost: totalCost,
      profit,
      margin: profitMargin,
    };
  }, [filteredOrders, products]);

  // Orders by status for the table
  const completedOrdersList = useMemo(() => {
    return filteredOrders.filter(o => o.status === 'completed');
  }, [filteredOrders]);

  const cancelledOrdersList = useMemo(() => {
    return filteredOrders.filter(o => o.status === 'cancelled');
  }, [filteredOrders]);

  // Calculate profit/loss for each order
  const getOrderProfit = (order: typeof orders[0]) => {
    const revenue = order.total || 0;
    let cost = 0;

    order.items?.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      const costPrice = product?.cost_price || 0;
      cost += costPrice * item.quantity;
    });

    return {
      revenue,
      cost,
      profit: revenue - cost,
      margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
    };
  };

  // Selected order details
  const selectedOrderData = useMemo(() => {
    if (!selectedOrder) return null;
    const order = orders.find(o => o.id === selectedOrder);
    if (!order) return null;

    const revenue = order.total || 0;
    let cost = 0;
    order.items?.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      const costPrice = product?.cost_price || 0;
      cost += costPrice * item.quantity;
    });

    return {
      order,
      profit: {
        revenue,
        cost,
        profit: revenue - cost,
        margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
      },
    };
  }, [selectedOrder, orders, products]);

  const periodLabels = { today: t('reports.today'), week: t('reports.thisWeek'), month: t('reports.thisMonth') };
  const periodKeys: ('today' | 'week' | 'month')[] = ['today', 'week', 'month'];

  // Pagination for order details table
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const currentOrdersList = orderTab === 'completed' ? completedOrdersList : cancelledOrdersList;
  const totalPages = Math.ceil(currentOrdersList.length / rowsPerPage);
  const paginatedOrders = currentOrdersList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset page when tab or period changes (handled in onClick)

  return (
    <div className="p-6 bg-[#1e2128] min-h-full overflow-y-auto">
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

      {/* Profit & Loss Table */}
      <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">💰 Profit & Loss</h2>
        <p className="text-gray-500 text-sm mb-4">{periodLabels[period]} overview</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Metric</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Amount</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr className="hover:bg-gray-700/30 transition">
                <td className="py-3 px-4 text-white font-semibold">💵 Total Revenue</td>
                <td className="py-3 px-4 text-right text-green-400 font-bold text-lg">${profitLoss.revenue.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-green-400 font-semibold">100%</td>
              </tr>
              <tr className="hover:bg-gray-700/30 transition">
                <td className="py-3 px-4 text-white font-semibold">📦 Total Cost</td>
                <td className="py-3 px-4 text-right text-red-400 font-bold text-lg">${profitLoss.cost.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-red-400 font-semibold">
                  {profitLoss.revenue > 0 ? ((profitLoss.cost / profitLoss.revenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="hover:bg-gray-700/30 transition bg-gray-800/50">
                <td className="py-3 px-4 text-white font-bold text-lg">
                  {profitLoss.profit >= 0 ? '✅ Profit' : '❌ Loss'}
                </td>
                <td className={`py-3 px-4 text-right font-bold text-xl ${profitLoss.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(profitLoss.profit).toFixed(2)}
                </td>
                <td className={`py-3 px-4 text-right font-bold text-lg ${profitLoss.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {profitLoss.margin.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Visual Bar */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Profit Margin</span>
                <span className={`font-bold ${profitLoss.margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {profitLoss.margin.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${profitLoss.margin >= 0 ? 'bg-linear-to-r from-green-500 to-green-400' : 'bg-linear-to-r from-red-500 to-red-400'}`}
                  style={{ width: `${Math.min(Math.abs(profitLoss.margin), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className={`rounded-lg p-4 border ${profitLoss.profit >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className={`text-sm font-semibold ${profitLoss.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profitLoss.profit >= 0 ? '📈 Net Profit' : '📉 Net Loss'}
            </p>
            <p className={`text-2xl font-bold mt-1 ${profitLoss.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(profitLoss.profit).toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm font-semibold">📊 Avg Order Profit</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              ${completedOrders.length > 0 ? (profitLoss.revenue / completedOrders.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5 mb-6">
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

      {/* Orders Detail Section */}
      <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5 mt-6">
        <h2 className="text-xl font-bold text-white mb-4">📋 Order Details</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setOrderTab('completed'); setSelectedOrder(null); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              orderTab === 'completed'
                ? 'bg-green-500 text-black'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            ✅ Completed ({completedOrdersList.length})
          </button>
          <button
            onClick={() => { setOrderTab('cancelled'); setSelectedOrder(null); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              orderTab === 'cancelled'
                ? 'bg-red-500 text-black'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            ❌ Cancelled ({cancelledOrdersList.length})
          </button>
        </div>

        {/* Orders Table */}
        {((orderTab === 'completed' && completedOrdersList.length === 0) ||
          (orderTab === 'cancelled' && cancelledOrdersList.length === 0)) ? (
          <div className="text-center text-gray-400 py-8">
            No {orderTab} orders for this period
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Order #</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Items</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Revenue</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Cost</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Profit/Loss</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Margin</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedOrders.map(order => {
                    const profit = getOrderProfit(order);
                    const orderId = order.id ?? 0;
                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-700/30 transition cursor-pointer ${
                          selectedOrder === orderId ? 'bg-yellow-500/10 border-l-2 border-yellow-500' : ''
                        }`}
                        onClick={() => setSelectedOrder(selectedOrder === orderId ? null : orderId)}
                      >
                        <td className="py-3 px-4 text-yellow-400 font-semibold">{order.order_number}</td>
                        <td className="py-3 px-4 text-white">{order.customer_name || '-'}</td>
                        <td className="py-3 px-4 text-gray-300 capitalize">
                          {order.order_type === 'dine-in' ? '🍽️ Dine-in' : order.order_type === 'takeout' ? '🥡 Takeout' : '🚚 Delivery'}
                          {order.table_number && ` (T${order.table_number})`}
                        </td>
                        <td className="py-3 px-4 text-white text-center">{order.items?.length || 0}</td>
                        <td className="py-3 px-4 text-right text-green-400 font-semibold">${profit.revenue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-red-400 font-semibold">${profit.cost.toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-bold ${profit.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {profit.profit >= 0 ? '+' : ''}${profit.profit.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${profit.margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {profit.margin.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                            {selectedOrder === orderId ? '▼ Hide' : '▶ View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, currentOrdersList.length)} of {currentOrdersList.length} orders
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                  ))}
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
          </>
        )}

        {/* Selected Order Details */}
        {selectedOrderData && (
          <div className="mt-6 bg-gray-800/50 rounded-lg border border-gray-600 p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Order: {selectedOrderData.order.order_number}
                </h3>
                <p className="text-gray-400 text-sm">
                  {selectedOrderData.order.customer_name || 'Walk-in Customer'} • 
                  {selectedOrderData.order.order_type === 'dine-in' ? ' 🍽️ Dine-in' : selectedOrderData.order.order_type === 'takeout' ? ' 🥡 Takeout' : ' 🚚 Delivery'}
                  {selectedOrderData.order.table_number && ` Table ${selectedOrderData.order.table_number}`}
                  {selectedOrderData.order.created_at && ` • ${new Date(selectedOrderData.order.created_at).toLocaleString()}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Order Items Table */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400">Product</th>
                      <th className="text-right py-2 px-3 text-gray-400">Qty</th>
                      <th className="text-right py-2 px-3 text-gray-400">Price</th>
                      <th className="text-right py-2 px-3 text-gray-400">Cost</th>
                      <th className="text-right py-2 px-3 text-gray-400">Revenue</th>
                      <th className="text-right py-2 px-3 text-gray-400">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {selectedOrderData.order.items?.map((item, idx) => {
                      const product = products.find(p => p.id === item.product_id);
                      const costPrice = product?.cost_price || 0;
                      const itemRevenue = item.subtotal || 0;
                      const itemCost = costPrice * item.quantity;
                      const itemProfit = itemRevenue - itemCost;

                      return (
                        <tr key={idx} className="hover:bg-gray-700/20">
                          <td className="py-2 px-3 text-white">{item.product_name}</td>
                          <td className="py-2 px-3 text-right text-gray-300">{item.quantity}</td>
                          <td className="py-2 px-3 text-right text-gray-300">${item.unit_price.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right text-red-400">${itemCost.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right text-green-400">${itemRevenue.toFixed(2)}</td>
                          <td className={`py-2 px-3 text-right font-semibold ${itemProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {itemProfit >= 0 ? '+' : ''}${itemProfit.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">${selectedOrderData.profit.revenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Cost</p>
                <p className="text-2xl font-bold text-red-400">${selectedOrderData.profit.cost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">
                  {selectedOrderData.profit.profit >= 0 ? '✅ Profit' : '❌ Loss'}
                </p>
                <p className={`text-2xl font-bold ${selectedOrderData.profit.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(selectedOrderData.profit.profit).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Profit Margin</p>
                <p className={`text-2xl font-bold ${selectedOrderData.profit.margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedOrderData.profit.margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
