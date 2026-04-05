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
  admin: ['dashboard', 'cashier', 'kitchen', 'orders', 'stock', 'recipes', 'customers', 'staff', 'reports', 'users', 'admin', 'settings'],
  manager: ['dashboard', 'cashier', 'kitchen', 'orders', 'stock', 'recipes', 'customers', 'staff', 'reports', 'settings'],
  cashier: ['cashier', 'orders'],
  chef: ['kitchen'],
  waiter: ['orders', 'kitchen', 'customers'],
  cleaner: ['dashboard'],
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
