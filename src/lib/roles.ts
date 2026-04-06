// Role-based access control configuration
export type UserRole = 'admin' | 'manager' | 'cashier' | 'chef' | 'waiter' | 'cleaner';

export const roleLabels: Record<UserRole, string> = {
  admin: '👑 Admin',
  manager: '👔 Manager',
  cashier: '💰 Cashier',
  chef: '👨‍🍳 Chef',
  waiter: '🤵 Waiter',
  cleaner: '🧹 Cleaner',
};

export const roleColors: Record<UserRole, string> = {
  admin: 'text-yellow-400',
  manager: 'text-purple-400',
  cashier: 'text-green-400',
  chef: 'text-orange-400',
  waiter: 'text-blue-400',
  cleaner: 'text-gray-400',
};

// Which sidebar modules each role can access
export const rolePermissions: Record<UserRole, string[]> = {
  admin: ['dashboard', 'cashier', 'kitchen', 'orders', 'orders-by-date', 'stock', 'recipes', 'customers', 'staff', 'reports', 'users', 'admin', 'user-manual', 'settings'],
  manager: ['dashboard', 'cashier', 'kitchen', 'orders', 'orders-by-date', 'stock', 'recipes', 'customers', 'staff', 'reports', 'user-manual', 'settings'],
  cashier: ['cashier', 'orders', 'orders-by-date', 'user-manual'],
  chef: ['kitchen', 'user-manual'],
  waiter: ['orders', 'orders-by-date', 'kitchen', 'customers', 'user-manual'],
  cleaner: ['dashboard', 'user-manual'],
};

// Default page each role lands on
export const roleDefaultPage: Record<UserRole, string> = {
  admin: 'dashboard',
  manager: 'dashboard',
  cashier: 'cashier',
  chef: 'kitchen',
  waiter: 'orders',
  cleaner: 'dashboard',
};
