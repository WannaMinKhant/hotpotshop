import { useState } from 'react';

type ModuleName = 'dashboard' | 'cashier' | 'kitchen' | 'orders' | 'stock' | 'customers' | 'staff' | 'reports';

interface SidebarProps {
  activeModule: ModuleName;
  onModuleChange: (module: ModuleName) => void;
}

const menuItems: { id: ModuleName; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'cashier', label: 'Cashier/POS', icon: '💰' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍲' },
  { id: 'orders', label: 'Orders', icon: '📋' },
  { id: 'stock', label: 'Stock Control', icon: '📦' },
  { id: 'customers', label: 'Customers', icon: '👥' },
  { id: 'staff', label: 'Staff', icon: '🧑‍💼' },
  { id: 'reports', label: 'Reports', icon: '📈' },
];

const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-[#1a1d23] border-r border-gray-700 flex flex-col transition-all duration-300 h-screen`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        <span className="text-3xl">🍲</span>
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-yellow-400">Hotpot Shop</h1>
            <p className="text-xs text-gray-400">Restaurant POS</p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-2 p-2 rounded-lg bg-[#272a30] hover:bg-[#32363d] text-gray-400 transition"
      >
        {collapsed ? '→' : '←'}
      </button>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onModuleChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  activeModule === item.id
                    ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20'
                    : 'text-gray-300 hover:bg-[#272a30] hover:text-white'
                }`}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-green-400">● Online</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
