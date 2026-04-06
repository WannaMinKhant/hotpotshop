import { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';
import DashboardHome from '../Components/DashboardHome';
import CashierPage from '../Components/CashierPage';
import KitchenPage from '../Components/KitchenPage';
import OrdersPage from '../Components/OrdersPage';
import StockControlPage from '../Components/StockControlPage';
import RecipesPage from '../Components/RecipesPage';
import CustomersPage from '../Components/CustomersPage';
import StaffPage from '../Components/StaffPage';
import ReportsPage from '../Components/ReportsPage';
import UsersPage from '../Components/UsersPage';
import AdminPage from '../Components/AdminPage';

const renderModule = (activeModule: string) => {
  switch (activeModule) {
    case 'dashboard':
      return <DashboardHome />;
    case 'cashier':
      return <CashierPage />;
    case 'kitchen':
      return <KitchenPage />;
    case 'orders':
      return <OrdersPage />;
    case 'stock':
      return <StockControlPage />;
    case 'recipes':
      return <RecipesPage />;
    case 'customers':
      return <CustomersPage />;
    case 'staff':
      return <StaffPage />;
    case 'reports':
      return <ReportsPage />;
    case 'users':
      return <UsersPage />;
    case 'admin':
      return <AdminPage />;
    default:
      return <DashboardHome />;
  }
};

interface DashboardPageProps {
  activeModule: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const DashboardPage = ({ activeModule, onNavigate, onLogout }: DashboardPageProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex bg-[#1e2128] h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} bg-[#1a1d23] border-r border-gray-700 flex flex-col transition-all duration-300 h-screen shrink-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-center">
          <span className="text-3xl animate-bounce-slow">🍲</span>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Hotpot Shop</h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">POS</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <Sidebar activeModule={activeModule} onModuleChange={(mod) => onNavigate(`/${mod}`)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activeModule={activeModule}
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onLogout={onLogout}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {renderModule(activeModule)}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
