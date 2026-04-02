import { useState } from 'react';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  avatar: string;
}

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [customers] = useState<Customer[]>([
    { id: 1, name: 'John Doe', phone: '+1 234-567-8900', email: 'john@email.com', totalOrders: 15, totalSpent: 320, lastVisit: 'Today', tier: 'gold', avatar: 'JD' },
    { id: 2, name: 'Sarah Lee', phone: '+1 234-567-8901', email: 'sarah@email.com', totalOrders: 8, totalSpent: 150, lastVisit: 'Yesterday', tier: 'silver', avatar: 'SL' },
    { id: 3, name: 'Mike Thompson', phone: '+1 234-567-8902', email: 'mike@email.com', totalOrders: 25, totalSpent: 580, lastVisit: 'Today', tier: 'platinum', avatar: 'MT' },
    { id: 4, name: 'Emma Wilson', phone: '+1 234-567-8903', email: 'emma@email.com', totalOrders: 5, totalSpent: 95, lastVisit: '3 days ago', tier: 'bronze', avatar: 'EW' },
    { id: 5, name: 'David Kim', phone: '+1 234-567-8904', email: 'david@email.com', totalOrders: 12, totalSpent: 240, lastVisit: '1 week ago', tier: 'gold', avatar: 'DK' },
  ]);

  const tierColors: Record<string, string> = {
    bronze: 'bg-orange-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-500',
  };

  return (
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">👥 Customers</h1>
          <p className="text-gray-400">Manage customer profiles and loyalty</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold">
          + Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#272a30] border border-gray-600 text-white"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map(customer => (
          <div key={customer.id} className="bg-[#272a30] rounded-xl border border-gray-700 p-5 hover:border-yellow-400 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-black text-lg ${tierColors[customer.tier]}`}>
                {customer.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{customer.name}</h3>
                <p className="text-gray-400 text-sm">{customer.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#1f2329] p-2 rounded-lg">
                <p className="text-xs text-gray-500">Orders</p>
                <p className="text-white font-bold">{customer.totalOrders}</p>
              </div>
              <div className="bg-[#1f2329] p-2 rounded-lg">
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="text-green-400 font-bold">${customer.totalSpent}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-bold text-black ${tierColors[customer.tier]}`}>
                {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
              </span>
              <span className="text-gray-400 text-sm">Last: {customer.lastVisit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomersPage;
