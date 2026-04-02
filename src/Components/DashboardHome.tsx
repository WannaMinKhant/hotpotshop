import StatCard from '../Components/StatCard';

const DashboardHome = () => {
  const recentOrders = [
    { id: '#HP-001', table: 'Table 5', items: 'Spicy Hotpot x2, Noodles, Drinks', total: '$45.00', status: 'Completed', time: '2 min ago' },
    { id: '#HP-002', table: 'Table 3', items: 'Herbal Hotpot x1, Meat Platter', total: '$38.50', status: 'Cooking', time: '8 min ago' },
    { id: '#HP-003', table: 'Table 7', items: 'Tom Yum Hotpot x3, Seafood Set', total: '$67.00', status: 'Ready', time: '15 min ago' },
    { id: '#HP-004', table: 'Takeout', items: 'Spicy Hotpot x1, Extra Tofu', total: '$22.00', status: 'Completed', time: '22 min ago' },
    { id: '#HP-005', table: 'Table 1', items: 'Mushroom Hotpot x2, Veggie Platter', total: '$35.00', status: 'Cooking', time: '5 min ago' },
  ];

  const popularItems = [
    { name: 'Spicy Hotpot Base', orders: 45, revenue: '$450' },
    { name: 'Herbal Hotpot Base', orders: 38, revenue: '$380' },
    { name: 'Tom Yum Hotpot', orders: 32, revenue: '$480' },
    { name: 'Mushroom Hotpot', orders: 28, revenue: '$280' },
    { name: 'Seafood Set Platter', orders: 25, revenue: '$625' },
  ];

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard title="Today's Revenue" value="$1,248" icon="💰" color="bg-green-500" trend="+12.5%" />
        <StatCard title="Active Orders" value="12" icon="📋" color="bg-blue-500" trend="+3" />
        <StatCard title="Tables Occupied" value="8/15" icon="🪑" color="bg-purple-500" />
        <StatCard title="Total Customers" value="56" icon="👥" color="bg-yellow-500" trend="+8.2%" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          </div>
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
                {recentOrders.map((order, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-[#32363d] transition">
                    <td className="px-5 py-4 text-yellow-400 font-semibold">{order.id}</td>
                    <td className="px-5 py-4 text-white">{order.table}</td>
                    <td className="px-5 py-4 text-gray-300">{order.items}</td>
                    <td className="px-5 py-4 text-green-400 font-bold">{order.total}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'Cooking' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-sm">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Top 5 Popular</h2>
          </div>
          <div className="p-5 space-y-4">
            {popularItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{item.name}</p>
                  <p className="text-gray-500 text-sm">{item.orders} orders today</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{item.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kitchen Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Status */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Table Status</h2>
            <span className="text-sm text-gray-400">8 of 15 occupied</span>
          </div>
          <div className="p-5 grid grid-cols-5 gap-3">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm ${
                  [0,2,4,5,7,9,10,12].includes(i) 
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
              <span className="text-white font-bold">38</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Takeout Orders</span>
              <span className="text-white font-bold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Delivery Orders</span>
              <span className="text-white font-bold">6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Cancelled Orders</span>
              <span className="text-red-400 font-bold">2</span>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Average Order Value</span>
                <span className="text-yellow-400 font-bold text-xl">$22.30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
