import { useState } from 'react';

interface KitchenOrder {
  id: string;
  table: string;
  items: { name: string; quantity: number; emoji: string; notes?: string }[];
  status: 'pending' | 'cooking' | 'ready';
  time: string;
  priority: 'normal' | 'high';
}

const KitchenPage = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([
    {
      id: 'KO-001',
      table: 'Table 5',
      items: [
        { name: 'Spicy Hotpot Base', quantity: 2, emoji: '🌶️' },
        { name: 'Beef Platter', quantity: 1, emoji: '🥩' },
        { name: 'Glass Noodles', quantity: 2, emoji: '🍜' },
      ],
      status: 'cooking',
      time: '5 min ago',
      priority: 'high',
    },
    {
      id: 'KO-002',
      table: 'Table 3',
      items: [
        { name: 'Herbal Hotpot Base', quantity: 1, emoji: '🍲' },
        { name: 'Shrimp x6', quantity: 2, emoji: '🦐' },
        { name: 'Tofu', quantity: 1, emoji: '🧈' },
      ],
      status: 'pending',
      time: '2 min ago',
      priority: 'normal',
    },
    {
      id: 'KO-003',
      table: 'Table 7',
      items: [
        { name: 'Tom Yum Hotpot', quantity: 1, emoji: '🌿' },
        { name: 'Seafood Set', quantity: 1, emoji: '🦀' },
        { name: 'Udon Noodles', quantity: 2, emoji: '🍜' },
        { name: 'Iced Lemon Tea', quantity: 3, emoji: '🍹' },
      ],
      status: 'cooking',
      time: '12 min ago',
      priority: 'normal',
    },
    {
      id: 'KO-004',
      table: 'Table 2',
      items: [
        { name: 'Mushroom Hotpot', quantity: 1, emoji: '🍄' },
        { name: 'Veggie Platter', quantity: 2, emoji: '🥬' },
      ],
      status: 'pending',
      time: '1 min ago',
      priority: 'normal',
    },
    {
      id: 'KO-005',
      table: 'Takeout',
      items: [
        { name: 'Spicy Hotpot', quantity: 1, emoji: '🌶️' },
        { name: 'Steamed Rice', quantity: 2, emoji: '🍚' },
      ],
      status: 'ready',
      time: '18 min ago',
      priority: 'high',
    },
  ]);

  const updateOrderStatus = (orderId: string, newStatus: KitchenOrder['status']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="h-screen bg-[#1e2128] p-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">🍲 Kitchen Display</h1>
        <p className="text-gray-400 mt-1">Manage and track all kitchen orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-yellow-400 text-sm font-semibold">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingOrders.length}</p>
          </div>
          <span className="text-3xl">⏳</span>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-sm font-semibold">Cooking</p>
            <p className="text-3xl font-bold text-blue-400">{cookingOrders.length}</p>
          </div>
          <span className="text-3xl">🔥</span>
        </div>
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-green-400 text-sm font-semibold">Ready</p>
            <p className="text-3xl font-bold text-green-400">{readyOrders.length}</p>
          </div>
          <span className="text-3xl">✅</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-400 text-xl">⏳</span>
            <h2 className="text-xl font-bold text-yellow-400">Pending ({pendingOrders.length})</h2>
          </div>
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <div
                key={order.id}
                className={`bg-[#272a30] rounded-xl border-2 ${order.priority === 'high' ? 'border-red-500' : 'border-yellow-500/50'}
                  hover:border-yellow-500 transition-all shadow-lg`}
              >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-lg">{order.table}</h3>
                    <p className="text-sm text-gray-400">{order.id} • {order.time}</p>
                  </div>
                  {order.priority === 'high' && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">URGENT</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-white">
                      <span>{item.emoji} {item.name}</span>
                      <span className="font-bold text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cooking')}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white py-2 rounded-lg font-bold transition"
                  >
                    Start Cooking →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cooking Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-400 text-xl">🔥</span>
            <h2 className="text-xl font-bold text-blue-400">Cooking ({cookingOrders.length})</h2>
          </div>
          <div className="space-y-3">
            {cookingOrders.map(order => (
              <div
                key={order.id}
                className={`bg-[#272a30] rounded-xl border-2 ${order.priority === 'high' ? 'border-red-500' : 'border-blue-500/50'}
                  hover:border-blue-500 transition-all shadow-lg`}
              >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-lg">{order.table}</h3>
                    <p className="text-sm text-gray-400">{order.id} • {order.time}</p>
                  </div>
                  {order.priority === 'high' && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">URGENT</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-white">
                      <span>{item.emoji} {item.name}</span>
                      {item.notes && <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">{item.notes}</span>}
                      <span className="font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="w-full bg-green-500 hover:bg-green-400 text-black py-2 rounded-lg font-bold transition"
                  >
                    Mark Ready ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-400 text-xl">✅</span>
            <h2 className="text-xl font-bold text-green-400">Ready ({readyOrders.length})</h2>
          </div>
          <div className="space-y-3">
            {readyOrders.map(order => (
              <div
                key={order.id}
                className="bg-[#272a30] rounded-xl border-2 border-green-500 hover:border-green-400 transition-all shadow-lg"
              >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-lg">{order.table}</h3>
                    <p className="text-sm text-gray-400">{order.id} • {order.time}</p>
                  </div>
                  {order.priority === 'high' && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">URGENT</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-white">
                      <span>{item.emoji} {item.name}</span>
                      <span className="font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <button
                    onClick={() => setOrders(prev => prev.filter(o => o.id !== order.id))}
                    className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg font-bold transition"
                  >
                    Delivered ↩
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenPage;
