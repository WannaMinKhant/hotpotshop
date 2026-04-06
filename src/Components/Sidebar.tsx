import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useI18nStore } from '../stores/i18nStore';
import { useThemeStore } from '../stores/themeStore';
import { useNotificationStore } from '../stores/notificationStore';
import { rolePermissions } from '../lib/roles';

type ModuleName = 'dashboard' | 'cashier' | 'kitchen' | 'orders' | 'stock' | 'recipes' | 'customers' | 'staff' | 'reports' | 'users' | 'admin';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: ModuleName) => void;
  onLogout?: () => void;
}

const allMenuItems: { id: ModuleName; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'sidebar.dashboard', icon: '📊' },
  { id: 'cashier', label: 'sidebar.cashier', icon: '💰' },
  { id: 'kitchen', label: 'sidebar.kitchen', icon: '🍲' },
  { id: 'orders', label: 'sidebar.orders', icon: '📋' },
  { id: 'stock', label: 'sidebar.stock', icon: '📦' },
  { id: 'recipes', label: 'sidebar.recipes', icon: '📖' },
  { id: 'customers', label: 'sidebar.customers', icon: '👥' },
  { id: 'staff', label: 'sidebar.staff', icon: '🧑‍💼' },
  { id: 'reports', label: 'sidebar.reports', icon: '📈' },
  { id: 'users', label: 'sidebar.users', icon: '🔑' },
  { id: 'admin', label: 'sidebar.admin', icon: '⚙️' },
];

const Sidebar = ({ activeModule, onModuleChange, onLogout }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, role } = useAuthStore();
  const { lang, setLang, t } = useI18nStore();
  const { toggleTheme, theme } = useThemeStore();
  const { kitchenCount, ordersCount, fetchCounts, subscribeToOrders } = useNotificationStore();
  const userEmail = user?.email || 'Admin User';
  const userRole = role || 'admin';
  const userInitial = userEmail.charAt(0).toUpperCase();

  // Initialize real-time subscriptions
  useEffect(() => {
    fetchCounts();
    subscribeToOrders();
    
    // Cleanup on unmount
    return () => {
      useNotificationStore.getState().unsubscribe();
    };
  }, [fetchCounts, subscribeToOrders]);

  // Filter menu items based on user role permissions
  const menuItems = allMenuItems.filter(item =>
    rolePermissions[userRole as keyof typeof rolePermissions]?.includes(item.id)
  );

  // Badge counts for specific modules
  const getBadgeCount = (moduleId: string): number => {
    if (moduleId === 'kitchen') return kitchenCount;
    if (moduleId === 'orders') return ordersCount;
    return 0;
  };

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
        {menuItems.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm text-center">No access</div>
        ) : (
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const badgeCount = getBadgeCount(item.id);
              return (
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
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{t(item.label)}</span>
                        {badgeCount > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            activeModule === item.id
                              ? 'bg-black/20 text-black'
                              : 'bg-red-500 text-white'
                          }`}>
                            {badgeCount}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userEmail}</p>
              <p className="text-xs text-green-400">● Online</p>
            </div>
          </div>

          {/* Theme & Language Toggles */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 bg-[#272a30] hover:bg-[#2f333a] text-gray-300 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button
              onClick={() => setLang(lang === 'en' ? 'mm' : 'en')}
              className="flex-1 bg-[#272a30] hover:bg-[#2f333a] text-gray-300 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              {lang === 'en' ? '🇬🇧 EN' : '🇲🇲 MM'}
            </button>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-2 w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm font-semibold transition"
            >
              🚪 Sign Out
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
