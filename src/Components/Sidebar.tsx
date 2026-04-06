import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useI18nStore } from '../stores/i18nStore';
import { useNotificationStore } from '../stores/notificationStore';
import { rolePermissions } from '../lib/roles';

type ModuleName = 'dashboard' | 'cashier' | 'kitchen' | 'orders' | 'orders-by-date' | 'stock' | 'recipes' | 'customers' | 'staff' | 'reports' | 'users' | 'admin' | 'user-manual';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: ModuleName) => void;
}

const allMenuItems: { id: ModuleName; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'sidebar.dashboard', icon: '📊' },
  { id: 'cashier', label: 'sidebar.cashier', icon: '💰' },
  { id: 'kitchen', label: 'sidebar.kitchen', icon: '🍲' },
  { id: 'orders', label: 'sidebar.orders', icon: '📋' },
  { id: 'orders-by-date', label: 'Orders by Date', icon: '📅' },
  { id: 'stock', label: 'sidebar.stock', icon: '📦' },
  { id: 'recipes', label: 'sidebar.recipes', icon: '📖' },
  { id: 'customers', label: 'sidebar.customers', icon: '👥' },
  { id: 'staff', label: 'sidebar.staff', icon: '🧑‍💼' },
  { id: 'reports', label: 'sidebar.reports', icon: '📈' },
  { id: 'users', label: 'sidebar.users', icon: '🔑' },
  { id: 'admin', label: 'sidebar.admin', icon: '⚙️' },
  { id: 'user-manual', label: 'User Manual', icon: '📚' },
];

const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const { role } = useAuthStore();
  const { t } = useI18nStore();
  const { kitchenCount, ordersCount, fetchCounts, subscribeToOrders } = useNotificationStore();
  const userRole = role || 'admin';

  // Initialize real-time subscriptions
  useEffect(() => {
    fetchCounts();
    subscribeToOrders();
    return () => {
      useNotificationStore.getState().unsubscribe();
    };
  }, [fetchCounts, subscribeToOrders]);

  // Filter menu items based on user role permissions
  const menuItems = allMenuItems.filter(item =>
    rolePermissions[userRole as keyof typeof rolePermissions]?.includes(item.id)
  );

  // Badge counts
  const getBadgeCount = (moduleId: string): number => {
    if (moduleId === 'kitchen') return kitchenCount;
    if (moduleId === 'orders') return ordersCount;
    return 0;
  };

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
      {menuItems.length === 0 ? (
        <div className="p-4 text-gray-500 text-xs text-center">No access</div>
      ) : (
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeModule === item.id;
            const badgeCount = getBadgeCount(item.id);
            return (
              <li key={item.id}>
                <button
                  onClick={() => onModuleChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-linear-to-r from-yellow-500 to-yellow-400 text-black font-bold shadow-lg shadow-yellow-500/25'
                      : 'text-gray-400 hover:bg-[#272a30] hover:text-white'
                    }`}
                >
                  <span className={`text-xl shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate flex-1 text-left text-sm">{t(item.label)}</span>
                  {badgeCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-black/20 text-black' : 'bg-red-500 text-white animate-pulse'
                    }`}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
};

export default Sidebar;
