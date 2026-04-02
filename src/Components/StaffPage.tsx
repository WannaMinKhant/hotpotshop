import { useState } from 'react';

interface StaffMember {
  id: number;
  name: string;
  role: 'manager' | 'chef' | 'waiter' | 'cashier' | 'cleaner';
  phone: string;
  status: 'on-duty' | 'off-duty' | 'break';
  avatar: string;
}

const roles: StaffMember['role'][] = ['manager', 'chef', 'waiter', 'cashier', 'cleaner'];
const roleEmojis: Record<string, string> = {
  manager: '👔',
  chef: '👨‍🍳',
  waiter: '🤵',
  cashier: '💰',
  cleaner: '🧹',
};
const roleColors: Record<string, string> = {
  manager: 'bg-purple-500',
  chef: 'bg-orange-500',
  waiter: 'bg-blue-500',
  cashier: 'bg-green-500',
  cleaner: 'bg-gray-500',
};

const StaffPage = () => {
  const [filterRole, setFilterRole] = useState<string>('');

  const [staff] = useState<StaffMember[]>([
    { id: 1, name: 'Alex Johnson', role: 'manager', phone: '+1-555-1001', status: 'on-duty', avatar: 'AJ' },
    { id: 2, name: 'Maria Chen', role: 'chef', phone: '+1-555-1002', status: 'on-duty', avatar: 'MC' },
    { id: 3, name: 'James Lee', role: 'chef', phone: '+1-555-1003', status: 'break', avatar: 'JL' },
    { id: 4, name: 'Sophie Kim', role: 'waiter', phone: '+1-555-1004', status: 'on-duty', avatar: 'SK' },
    { id: 5, name: 'Tom Brown', role: 'waiter', phone: '+1-555-1005', status: 'off-duty', avatar: 'TB' },
    { id: 6, name: 'Lisa Park', role: 'cashier', phone: '+1-555-1006', status: 'on-duty', avatar: 'LP' },
    { id: 7, name: 'Mike Davis', role: 'waiter', phone: '+1-555-1007', status: 'on-duty', avatar: 'MD' },
    { id: 8, name: 'Anna White', role: 'cleaner', phone: '+1-555-1008', status: 'on-duty', avatar: 'AW' },
  ]);

  const filteredStaff = filterRole ? staff.filter(s => s.role === filterRole) : staff;
  const onDuty = staff.filter(s => s.status === 'on-duty').length;
  const onBreak = staff.filter(s => s.status === 'break').length;
  const offDuty = staff.filter(s => s.status === 'off-duty').length;

  const statusColors: Record<string, string> = {
    'on-duty': 'bg-green-500 text-black',
    'off-duty': 'bg-gray-500 text-white',
    break: 'bg-yellow-500 text-black',
  };

  return (
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">🧑‍💼 Staff Management</h1>
        <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold">
          + Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold">On Duty</p>
          <p className="text-3xl font-bold text-green-400">{onDuty}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-semibold">On Break</p>
          <p className="text-3xl font-bold text-yellow-400">{onBreak}</p>
        </div>
        <div className="bg-gray-500/20 border border-gray-500 rounded-xl p-4">
          <p className="text-gray-400 text-sm font-semibold">Off Duty</p>
          <p className="text-3xl font-bold text-gray-400">{offDuty}</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-semibold">Total Staff</p>
          <p className="text-3xl font-bold text-blue-400">{staff.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="bg-[#272a30] border border-gray-600 rounded-lg px-4 py-2 text-white"
        >
          <option value="">All Roles</option>
          {roles.map(r => (
            <option key={r} value={r}>
              {roleEmojis[r]} {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStaff.map(person => (
          <div key={person.id} className="bg-[#272a30] rounded-xl border border-gray-700 p-5 hover:border-yellow-400 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white ${roleColors[person.role]}`}>
                {person.avatar}
              </div>
              <div>
                <h3 className="text-white font-bold">{person.name}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  {roleEmojis[person.role]} {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">{person.phone}</p>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[person.status]}`}>
                {person.status.replace('-', ' ').toUpperCase()}
              </span>
              <div className="flex gap-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffPage;
