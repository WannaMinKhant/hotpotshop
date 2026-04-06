import { useI18nStore } from '../stores/i18nStore';
import { useThemeStore } from '../stores/themeStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';
import { roleLabels } from '../lib/roles';

interface NavbarProps {
  activeModule: string;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onLogout?: () => void;
}

const Navbar = ({ activeModule, onToggleSidebar, sidebarCollapsed, onLogout }: NavbarProps) => {
  const { lang, setLang, t } = useI18nStore();
  const { toggleTheme, theme } = useThemeStore();
  const { kitchenCount, ordersCount } = useNotificationStore();
  const { user, role } = useAuthStore();

  const userEmail = user?.email || 'Admin User';
  const userRole = role || 'admin';
  const userInitial = userEmail.charAt(0).toUpperCase();
  const totalNotifications = kitchenCount + ordersCount;

  const moduleLabels: Record<string, string> = {
    dashboard: 'sidebar.dashboard',
    cashier: 'sidebar.cashier',
    kitchen: 'sidebar.kitchen',
    orders: 'sidebar.orders',
    stock: 'sidebar.stock',
    recipes: 'sidebar.recipes',
    customers: 'sidebar.customers',
    staff: 'sidebar.staff',
    reports: 'sidebar.reports',
    users: 'sidebar.users',
    admin: 'sidebar.admin',
  };

  const moduleIcons: Record<string, string> = {
    dashboard: '📊',
    cashier: '💰',
    kitchen: '🍲',
    orders: '📋',
    stock: '📦',
    recipes: '📖',
    customers: '👥',
    staff: '🧑‍💼',
    reports: '📈',
    users: '🔑',
    admin: '⚙️',
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <header className="h-16 bg-[#1a1d23] border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
      {/* Left: Sidebar toggle + Module title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-[#272a30] hover:bg-[#32363d] text-gray-400 transition"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{moduleIcons[activeModule] || '📊'}</span>
          <div>
            <h1 className="text-lg font-bold text-white">{t(moduleLabels[activeModule] || 'sidebar.dashboard')}</h1>
            <p className="text-[10px] text-gray-500">{currentTime}</p>
          </div>
        </div>
      </div>

      {/* Center: Notification Bell */}
      <div className="flex items-center gap-3">
        {totalNotifications > 0 && (
          <div className="relative group">
            <button className="p-2 rounded-lg bg-[#272a30] hover:bg-[#32363d] transition">
              <span className="text-xl">🔔</span>
            </button>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
              {totalNotifications > 99 ? '99+' : totalNotifications}
            </span>
            {/* Notification Tooltip */}
            <div className="absolute top-full right-0 mt-2 w-64 bg-[#272a30] border border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3">
                <h3 className="text-sm font-bold text-white mb-2">Notifications</h3>
                {kitchenCount > 0 && (
                  <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-blue-500/10 border border-blue-500/20">
                    <span>🍲</span>
                    <span className="text-xs text-blue-400">{kitchenCount} kitchen order{kitchenCount > 1 ? 's' : ''}</span>
                  </div>
                )}
                {ordersCount > 0 && (
                  <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-yellow-500/10 border border-yellow-500/20 mt-1">
                    <span>📋</span>
                    <span className="text-xs text-yellow-400">{ordersCount} active order{ordersCount > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Theme, Language, User, Logout */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#272a30] hover:bg-[#32363d] transition text-sm"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span className="text-gray-400 hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'mm' : 'en')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#272a30] hover:bg-[#32363d] transition text-sm"
          title={`Switch to ${lang === 'en' ? 'Myanmar' : 'English'}`}
        >
          <span>{lang === 'en' ? '🌎' : '🌏'}</span>
          <span className="text-gray-400 hidden sm:inline">{lang === 'en' ? 'EN' : 'MM'}</span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-700" />

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
              {userInitial}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1d23]" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white leading-tight">{userEmail.split('@')[0]}</p>
            <p className="text-[10px] text-yellow-400">{roleLabels[userRole as keyof typeof roleLabels]}</p>
          </div>
        </div>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition"
            title="Sign Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
