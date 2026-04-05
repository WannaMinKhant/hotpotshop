import { useEffect, useMemo } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useProductStore } from '../stores/productsStore';
import { useCustomerStore } from '../stores/customerStore';
import StatCard from '../Components/StatCard';
 
const DashboardHome = () => {
  const { orders, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const { customers, fetchCustomers } = useCustomerStore();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
  }, [fetchOrders, fetchProducts, fetchCustomers]);

  // Computed stats
  const todayOrders = orders.filter(o => {
    if (!o.created_at) return false;
    const d = new Date(o.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const todayRevenue = todayOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const activeOrders = orders.filter(o =>
    ['pending', 'preparing', 'ready', 'served'].includes(o.status)
  );

  const completedOrders = orders.filter(o => o.status === 'completed');
  const avgOrderValue = completedOrders.length > 0
    ? completedOrders.reduce((sum, o) => sum + o.total, 0) / completedOrders.length
    : 0;

  // Popular items (from order_items)
  const popularItems = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items?.forEach(item => {
        if (!counts[item.product_name]) {
          counts[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
        }
        counts[item.product_name].qty += item.quantity;
        counts[item.product_name].revenue += item.subtotal;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  // Low stock count
  const lowStockCount = products.filter(p => p.stock_quantity <= p.reorder_point).length;

  // Recent orders (latest 5)
  const recentOrders = orders.slice(0, 5);

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    preparing: 'Cooking',
    ready: 'Ready',
    served: 'Served',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    served: 'bg-green-500/20 text-green-400',
    preparing: 'bg-blue-500/20 text-blue-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    ready: 'bg-purple-500/20 text-purple-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  // Table count mock (we don't have tables in schema yet)
  const totalTables = 15;
  const occupiedTables = Math.min(activeOrders.filter(o => o.table_number).length, totalTables);

  // Order type counts
  const dineInCount = orders.filter(o => o.order_type === 'dine-in').length;
  const takeoutCount = orders.filter(o => o.order_type === 'takeout').length;
  const deliveryCount = orders.filter(o => o.order_type === 'delivery').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard title="Today's Revenue" value={`$${todayRevenue.toFixed(2)}`} icon="💰" color="bg-green-500" />
        <StatCard title="Active Orders" value={String(activeOrders.length)} icon="📋" color="bg-blue-500" />
        <StatCard title="Tables Occupied" value={`${occupiedTables}/${totalTables}`} icon="🪑" color="bg-purple-500" />
        <StatCard title="Total Customers" value={String(customers.length)} icon="👥" color="bg-yellow-500" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400 text-sm">
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Table</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-800 hover:bg-[#32363d] transition">
                      <td className="px-5 py-4 text-yellow-400 font-semibold">{order.order_number}</td>
                      <td className="px-5 py-4 text-white">{order.table_number ? `Table ${order.table_number}` : order.order_type}</td>
                      <td className="px-5 py-4 text-gray-300 truncate max-w-[200px]">
                        {order.items?.map(i => `${i.product_name} ×${i.quantity}`).join(', ') || '—'}
                      </td>
                      <td className="px-5 py-4 text-green-400 font-bold">${order.total.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Popular Items */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Top 5 Popular</h2>
          </div>
          {popularItems.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No data yet</div>
          ) : (
            <div className="p-5 space-y-4">
              {popularItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{item.name}</p>
                    <p className="text-gray-500 text-sm">{item.qty} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">${item.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kitchen Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Status */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Table Status</h2>
            <span className="text-sm text-gray-400">{occupiedTables} of {totalTables} occupied</span>
          </div>
          <div className="p-5 grid grid-cols-5 gap-3">
            {Array.from({ length: totalTables }, (_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm ${
                  i < occupiedTables
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                    : 'bg-green-500/20 border-2 border-green-500 text-green-400'
                }`}
              >
                T{i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Quick Summary</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Dine-in Orders</span>
              <span className="text-white font-bold">{dineInCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Takeout Orders</span>
              <span className="text-white font-bold">{takeoutCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Delivery Orders</span>
              <span className="text-white font-bold">{deliveryCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Cancelled Orders</span>
              <span className="text-red-400 font-bold">{cancelledCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Low Stock Items</span>
              <span className="text-red-400 font-bold">{lowStockCount}</span>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Average Order Value</span>
                <span className="text-yellow-400 font-bold text-xl">${avgOrderValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
