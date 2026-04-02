export interface Staff {
  id?: number;
  name: string;
  role: 'manager' | 'chef' | 'waiter' | 'cashier' | 'cleaner';
  phone: string;
  email?: string;
  status: 'on-duty' | 'off-duty' | 'break';
  salary?: number;
  hire_date?: string;
  created_at?: string;
}

export interface Product {
  id?: number;
  name: string;
  category: 'bases' | 'meats' | 'seafood' | 'veggies' | 'noodles' | 'drinks' | 'sauces';
  stock_quantity: number;
  unit: string;
  reorder_point: number;
  price: number;
  cost_price?: number;
  emoji?: string;
  created_at?: string;
}

export interface Order {
  id?: number;
  order_number: string;
  customer_name?: string;
  table_number?: number;
  order_type: 'dine-in' | 'takeout' | 'delivery';
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  items?: OrderItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  total_orders: number;
  total_spent: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  last_visit?: string;
  notes?: string;
  created_at?: string;
}

export type TableName = 'staff' | 'products' | 'orders' | 'order_items' | 'customers';
