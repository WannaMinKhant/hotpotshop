interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => {
  return (
    <div className="bg-[#272a30] rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all duration-200 shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <span className={trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
            {trend}
          </span>
          <span className="text-gray-500">from yesterday</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
