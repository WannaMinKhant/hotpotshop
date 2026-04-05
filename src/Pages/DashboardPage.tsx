import Sidebar from '../Components/Sidebar';
import DashboardHome from '../Components/DashboardHome';
import CashierPage from '../Components/CashierPage';
import KitchenPage from '../Components/KitchenPage';
import OrdersPage from '../Components/OrdersPage';
import StockControlPage from '../Components/StockControlPage';
import CustomersPage from '../Components/CustomersPage';
import StaffPage from '../Components/StaffPage';
import ReportsPage from '../Components/ReportsPage';

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
    case 'customers':
      return <CustomersPage />;
    case 'staff':
      return <StaffPage />;
    case 'reports':
      return <ReportsPage />;
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
  return (
    <div className="flex bg-[#1e2128] h-screen overflow-hidden">
      <Sidebar activeModule={activeModule} onModuleChange={(mod) => onNavigate(`/${mod}`)} onLogout={onLogout} />
      <div className="flex-1 overflow-hidden">
        {renderModule(activeModule)}
      </div>
    </div>
  );
};

export default DashboardPage;
