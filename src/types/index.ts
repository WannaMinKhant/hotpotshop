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
  base_unit?: string;
  conversion_factor?: number;
  reorder_point: number;
  price: number;
  cost_price?: number;
  emoji?: string;
  created_at?: string;
}

export interface StockMovement {
  id?: number;
  product_id: number;
  product_name?: string;
  movement_type: 'purchase' | 'sale' | 'adjustment' | 'waste' | 'return';
  quantity: number;
  unit: string;
  reference?: string;
  notes?: string;
  cost_per_unit?: number;
  total_cost?: number;
  created_by?: string;
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
  payment_method?: string;
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

export interface Recipe {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  cost_price?: number;
  emoji?: string;
  is_active: boolean;
  ingredients?: RecipeIngredient[];
  created_at?: string;
}

export interface RecipeIngredient {
  id?: number;
  recipe_id?: number;
  product_id: number;
  product_name?: string;
  product_emoji?: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export type TableName = 'staff' | 'products' | 'orders' | 'order_items' | 'customers' | 'stock_movements' | 'recipes' | 'recipe_ingredients';

// Enum type aliases for component imports
export type OrderStatusEnum = Order['status'];
export type OrderTypeEnum = Order['order_type'];
export type RoleEnum = Staff['role'];
export type StatusEnum = Staff['status'];
export type ProductCategory = Product['category'];
export type CustomerTier = Customer['tier'];
export type MovementType = StockMovement['movement_type'];
