import { useEffect, useMemo, useState } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useProductStore } from '../stores/productsStore';
import { useCustomerStore } from '../stores/customerStore';
import { useTableStore } from '../stores/tableStore';
import { useStaffStore } from '../stores/staffStore';
import StatCard from '../Components/StatCard';

interface TableOrder {
  tableNumber: number;
  orders: {
    order_number: string;
    status: string;
    total: number;
    items: string;
    time: string;
  }[];
}

const DashboardHome = () => {
  const { orders, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { tables, fetchTables } = useTableStore();
  const { staff, fetchStaff } = useStaffStore();

  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
    fetchTables();
    fetchStaff();

    // Unsubscribe first to prevent duplicates (HMR in dev mode)
    useStaffStore.getState().unsubscribe();
    // Subscribe to realtime staff status changes
    useStaffStore.getState().subscribe();

    // Cleanup on unmount
    return () => {
      useStaffStore.getState().unsubscribe();
    };
  }, [fetchOrders, fetchProducts, fetchCustomers, fetchTables, fetchStaff]);

  // Build table orders map from active orders
  const tableOrders = useMemo(() => {
    const active = orders.filter(o =>
      ['pending', 'preparing', 'ready', 'served'].includes(o.status) && o.table_number
    );

    const map: Record<number, TableOrder> = {};
    active.forEach(o => {
      const tn = o.table_number!;
      if (!map[tn]) {
        map[tn] = {
          tableNumber: tn,
          orders: [],
        };
      }
      map[tn].orders.push({
        order_number: o.order_number || '',
        status: o.status,
        total: o.total || 0,
        items: o.items?.map(i => `${i.product_name} ×${i.quantity}`).join(', ') || '',
        time: o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      });
    });

    return Object.values(map).sort((a, b) => a.tableNumber - b.tableNumber);
  }, [orders]);

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

  // Table status from real data
  const activeTables = new Set(activeOrders.filter(o => o.table_number).map(o => o.table_number));
  const occupiedTables = activeTables.size;
  const totalTables = tables.length || 15;

  // Order type counts
  const dineInCount = orders.filter(o => o.order_type === 'dine-in').length;
  const takeoutCount = orders.filter(o => o.order_type === 'takeout').length;
  const deliveryCount = orders.filter(o => o.order_type === 'delivery').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  // Online staff (on-duty or break)
  const onlineStaff = useMemo(() => {
    return staff.filter(s => s.status === 'on-duty' || s.status === 'break');
  }, [staff]);

  const roleIcons: Record<string, string> = {
    manager: '👔',
    chef: '👨‍🍳',
    waiter: '🤵',
    cashier: '💰',
    cleaner: '🧹',
  };

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
                      <td className="px-5 py-4 text-gray-300 truncate max-w-50">
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

      {/* Online Staff */}
      <div className="mb-6 bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">🟢 Online Account</h2>
          <p className="text-xs text-green-400 font-semibold mt-1">{onlineStaff.length} active</p>
        </div>
        {onlineStaff.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-3xl mb-2">👤</p>
            <p className="text-sm">No staff on duty</p>
          </div>
        ) : (
          <div className="p-5 space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {onlineStaff.map(member => (
              <div key={member.id} className="flex items-center gap-3 bg-[#1f2329] rounded-lg p-2.5">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1f2329]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{member.name}</p>
                  <p className="text-gray-500 text-[10px]">
                    {roleIcons[member.role] || '👤'} {member.role}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  member.status === 'on-duty'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {member.status === 'on-duty' ? '● Duty' : '☕ Break'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kitchen Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Status */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Table Status</h2>
            <span className="text-sm text-gray-400">{occupiedTables} of {totalTables} occupied</span>
          </div>

          {/* Tables Grid */}
          <div className="p-5 grid grid-cols-5 gap-3">
            {tables.length === 0 ? (
              <div className="col-span-5 text-center text-gray-500 py-4">No tables configured</div>
            ) : (
              tables
                .filter(t => t.is_active)
                .sort((a, b) => a.table_number - b.table_number)
                .map(table => {
                  const isOccupied = activeTables.has(table.table_number);
                  const orderCount = tableOrders.find(to => to.tableNumber === table.table_number)?.orders.length || 0;
                  return (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(isOccupied ? table.table_number : null)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center font-bold text-sm transition-all cursor-pointer
                        ${isOccupied
                          ? 'bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30 hover:scale-105'
                          : 'bg-green-500/20 border-2 border-green-500 text-green-400'
                        }`}
                      title={isOccupied ? `Table ${table.table_number} — ${orderCount} order(s)` : `Table ${table.table_number} — Free`}
                    >
                      <span>T{table.table_number}</span>
                      {isOccupied && <span className="text-[10px] font-normal">({orderCount})</span>}
                    </button>
                  );
                })
            )}
          </div>

          {/* Table Orders Panel */}
          {selectedTable !== null && (
            <div className="p-5 border-t border-gray-700 bg-[#1f2329]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-white">📋 Table {selectedTable} — Current Orders</h3>
                <button onClick={() => setSelectedTable(null)} className="text-gray-400 hover:text-white text-sm">✕ Close</button>
              </div>
              {(() => {
                const tableData = tableOrders.find(to => to.tableNumber === selectedTable);
                if (!tableData || tableData.orders.length === 0) {
                  return <p className="text-gray-500 text-sm">No active orders for this table</p>;
                }
                return (
                  <div className="space-y-2">
                    {tableData.orders.map((order, i) => (
                      <div key={i} className="bg-[#272a30] rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-yellow-400 font-bold text-sm">{order.order_number}</p>
                          <p className="text-gray-400 text-xs truncate max-w-50">{order.items}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {statusLabels[order.status]}
                          </span>
                          <p className="text-green-400 font-bold text-sm mt-1">${order.total.toFixed(2)}</p>
                          <p className="text-gray-500 text-xs">{order.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
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
