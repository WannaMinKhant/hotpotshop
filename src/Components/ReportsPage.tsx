import { useState } from 'react';

const ReportsPage = () => {
  const [period, setPeriod] = useState('today');

  // Sample data
  const salesData = [
    { day: 'Mon', revenue: 850, orders: 45 },
    { day: 'Tue', revenue: 920, orders: 52 },
    { day: 'Wed', revenue: 1100, orders: 60 },
    { day: 'Thu', revenue: 980, orders: 55 },
    { day: 'Fri', revenue: 1400, orders: 78 },
    { day: 'Sat', revenue: 1650, orders: 85 },
    { day: 'Sun', revenue: 1250, orders: 68 },
  ];
  const maxRevenue = Math.max(...salesData.map(d => d.revenue));

  const categoryData = [
    { name: 'Hotpot Bases', revenue: 520, percentage: 35, color: 'bg-red-500' },
    { name: 'Meats', revenue: 380, percentage: 25, color: 'bg-orange-500' },
    { name: 'Seafood', revenue: 340, percentage: 23, color: 'bg-blue-500' },
    { name: 'Vegetables', revenue: 150, percentage: 10, color: 'bg-green-500' },
    { name: 'Noodles', revenue: 70, percentage: 5, color: 'bg-yellow-500' },
    { name: 'Drinks', revenue: 30, percentage: 2, color: 'bg-purple-500' },
  ];

  const paymentMethods = [
    { method: '💳 Card', count: 120, percentage: 45, color: 'bg-blue-500' },
    { method: '💵 Cash', count: 80, percentage: 30, color: 'bg-green-500' },
    { method: '📱 Digital', count: 66, percentage: 25, color: 'bg-purple-500' },
  ];

  const hourlyData = [
    { hour: '11am', orders: 8, color: 'h-8' },
    { hour: '12pm', orders: 15, color: 'h-16' },
    { hour: '1pm', orders: 20, color: 'h-20' },
    { hour: '2pm', orders: 12, color: 'h-12' },
    { hour: '3pm', orders: 5, color: 'h-5' },
    { hour: '4pm', orders: 8, color: 'h-8' },
    { hour: '5pm', orders: 10, color: 'h-10' },
    { hour: '6pm', orders: 18, color: 'h-18' },
    { hour: '7pm', orders: 22, color: 'h-22' },
    { hour: '8pm', orders: 25, color: 'h-24' },
    { hour: '9pm', orders: 15, color: 'h-16' },
  ];

  return (
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">📈 Reports & Analytics</h1>
        <div className="flex bg-[#272a30] rounded-lg p-1">
          {['today', 'week', 'month'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md transition ${period === p ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400">$7,150</p>
          <p className="text-xs text-green-400 mt-1">↑ 12% from last {period}</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-semibold">Total Orders</p>
          <p className="text-3xl font-bold text-blue-400">266</p>
          <p className="text-xs text-blue-400 mt-1">↑ 8% from last {period}</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500 rounded-xl p-4">
          <p className="text-purple-400 text-sm font-semibold">Avg. Order Value</p>
          <p className="text-3xl font-bold text-purple-400">$26.88</p>
          <p className="text-xs text-purple-400 mt-1">↑ 3% from last {period}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-semibold">Unique Customers</p>
          <p className="text-3xl font-bold text-yellow-400">180</p>
          <p className="text-xs text-yellow-400 mt-1">↑ 15% from last {period}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales by Day */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-4">Revenue by Day</h2>
          <div className="flex items-end gap-3 h-52">
            {salesData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-yellow-400 rounded-t-lg transition-all"
                  style={{ height: `${(day.revenue / maxRevenue) * 160}px` }}
                />
                <span className="text-xs text-gray-400">{day.day}</span>
                <span className="text-xs text-green-400 font-semibold">${day.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-4">Sales by Category</h2>
          <div className="space-y-3">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-white text-sm w-28">{cat.name}</span>
                <div className="flex-1 bg-[#1f2329] rounded-full h-4 overflow-hidden">
                  <div className={`${cat.color} h-4 rounded-full transition-all`} style={{ width: `${cat.percentage}%` }} />
                </div>
                <span className="text-white font-bold text-sm w-24 text-right">${cat.revenue} ({cat.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-4">Peak Hours</h2>
          <div className="flex items-end gap-2 h-52">
            {hourlyData.map((hour, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group">
                <div
                  className={`w-full bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t transition-all group-hover:from-yellow-400 group-hover:to-yellow-200`}
                  style={{ height: `${hour.orders * 10}px` }}
                />
                <span className="text-xs text-gray-400">{hour.hour}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-yellow-400 mt-2 text-center">Busiest: 8pm (25 orders)</p>
        </div>

        {/* Payment Methods */}
        <div className="bg-[#272a30] rounded-xl border border-gray-700 p-5">
          <h2 className="text-xl font-bold text-white mb-4">Payment Methods</h2>
          <div className="space-y-4">
            {paymentMethods.map((pm, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-semibold">{pm.method}</span>
                  <span className="text-gray-400">{pm.count} payments ({pm.percentage}%)</span>
                </div>
                <div className="bg-[#1f2329] rounded-full h-4 overflow-hidden">
                  <div className={`${pm.color} h-4 rounded-full transition-all`} style={{ width: `${pm.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#1f2329] rounded-lg">
            <h3 className="text-lg font-bold text-white mb-2">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">87%</p>
                <p className="text-sm text-gray-400">Customer Satisfaction</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">18 min</p>
                <p className="text-sm text-gray-400">Avg. Delivery Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">34%</p>
                <p className="text-sm text-gray-400">Return Customer Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">2.5%</p>
                <p className="text-sm text-gray-400">Order Cancellation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
