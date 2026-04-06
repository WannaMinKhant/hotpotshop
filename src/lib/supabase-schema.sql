-- ============================================
-- B2M Hotpot Restaurant Management System
-- COMPLETE DATABASE RESET & RECREATE SCRIPT
-- ============================================
-- WARNING: This will DROP ALL existing tables and recreate them.
-- ALL existing data will be permanently lost.
-- Run this in Supabase SQL Editor.
-- ============================================

-- ============================================
-- STEP 1: DROP ALL TABLES (reverse dependency order)
-- ============================================

DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS staff CASCADE;

-- ============================================
-- STEP 2: RECREATE ALL TABLES
-- ============================================

-- 1. STAFF
CREATE TABLE staff (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'chef', 'waiter', 'cashier', 'cleaner')),
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'off-duty' CHECK (status IN ('on-duty', 'off-duty', 'break')),
  salary NUMERIC(10, 2),
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  base_unit TEXT,
  conversion_factor NUMERIC(10, 4) DEFAULT 1,
  reorder_point NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cost_price NUMERIC(10, 2) DEFAULT 0.00,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES (dynamic, with subcategories)
CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  emoji TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLES (dynamic restaurant tables)
CREATE TABLE tables (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_number INTEGER NOT NULL UNIQUE,
  seats INTEGER DEFAULT 4,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STOCK MOVEMENTS (purchase/sale/waste tracking)
CREATE TABLE stock_movements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'waste', 'return')),
  quantity NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  cost_per_unit NUMERIC(10, 2),
  total_cost NUMERIC(10, 2),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  table_number INTEGER,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine-in', 'takeout', 'delivery')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
  subtotal NUMERIC(10, 2) DEFAULT 0.00,
  tax_amount NUMERIC(10, 2) DEFAULT 0.00,
  total NUMERIC(10, 2) DEFAULT 0.00,
  notes TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS
CREATE TABLE order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served'))
);

-- 8. CUSTOMERS
CREATE TABLE customers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(10, 2) DEFAULT 0.00,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  last_visit DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RECIPES (menu items like curries, combos)
CREATE TABLE recipes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cost_price NUMERIC(10, 2) DEFAULT 0.00,
  emoji TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. RECIPE INGREDIENTS (links recipes to products)
CREATE TABLE recipe_ingredients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  notes TEXT,
  UNIQUE (recipe_id, product_id)
);

-- 11. USER PROFILES (auth + role management)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier', 'chef', 'waiter', 'cleaner')),
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MIGRATION: Add item-level status to existing order_items table
-- Run this ONLY if you already have the order_items table created.
-- This adds status column with default 'pending' for all existing items.
-- ============================================
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served'));
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_product ON recipe_ingredients(product_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_tables_number ON tables(table_number);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================
-- STEP 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read user profiles" ON user_profiles;
CREATE POLICY "Anyone can read user profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert profile" ON user_profiles;
CREATE POLICY "Users can insert profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- ============================================
-- STEP 5: ENABLE REALTIME ON ALL TABLES
-- ============================================
DO $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('realtime_setup'));

  ALTER PUBLICATION supabase_realtime ADD TABLE staff;
  ALTER PUBLICATION supabase_realtime ADD TABLE products;
  ALTER PUBLICATION supabase_realtime ADD TABLE categories;
  ALTER PUBLICATION supabase_realtime ADD TABLE tables;
  ALTER PUBLICATION supabase_realtime ADD TABLE stock_movements;
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
  ALTER PUBLICATION supabase_realtime ADD TABLE customers;
  ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
  ALTER PUBLICATION supabase_realtime ADD TABLE recipe_ingredients;
  ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- STEP 6: GRANT SERVICE ROLE ACCESS
-- ============================================
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON recipes TO service_role;
GRANT ALL ON recipe_ingredients TO service_role;
GRANT ALL ON stock_movements TO service_role;
GRANT ALL ON categories TO service_role;
GRANT ALL ON tables TO service_role;

-- ============================================
-- STEP 7: SEED DEFAULT DATA (optional)
-- ============================================

-- Add default tables (adjust as needed)
INSERT INTO tables (table_number, seats, is_active) VALUES
  (1, 2, true),
  (2, 4, true),
  (3, 4, true),
  (4, 6, true),
  (5, 6, true),
  (6, 4, true),
  (7, 8, true),
  (8, 4, true),
  (9, 2, true),
  (10, 6, true),
  (11, 4, true),
  (12, 8, true),
  (13, 4, true),
  (14, 6, true),
  (15, 4, true)
ON CONFLICT (table_number) DO NOTHING;

-- Add default categories (adjust as needed)
INSERT INTO categories (name, parent_id, emoji, is_active, sort_order) VALUES
  ('Bases', NULL, '🍲', true, 1),
  ('Meats', NULL, '🥩', true, 2),
  ('Seafood', NULL, '🦐', true, 3),
  ('Vegetables', NULL, '🥬', true, 4),
  ('Noodles & Rice', NULL, '🍜', true, 5),
  ('Drinks', NULL, '🍹', true, 6),
  ('Sauces', NULL, '🧂', true, 7)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 8: AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================
-- This trigger automatically creates a user_profiles
-- entry when a new user signs up via Supabase Auth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cashier'),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 9: VERIFY
-- ============================================
SELECT 'Tables created' AS status, COUNT(*) AS table_count
FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
