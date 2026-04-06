-- ============================================
-- B2M Hotpot Restaurant Management System
-- DELETE ALL DATA EXCEPT user_profiles, auth, categories
-- ============================================
-- Run this in Supabase SQL Editor to clear all data
-- while preserving user accounts, auth, and categories
-- ============================================

-- ============================================
-- DELETE DATA FROM ALL TABLES EXCEPT PRESERVED ONES
-- ============================================

-- Delete from stock_movements (depends on products)
DELETE FROM stock_movements;

-- Delete from order_items (depends on orders)
DELETE FROM order_items;

-- Delete from orders
DELETE FROM orders;

-- Delete from recipe_ingredients (depends on recipes and products)
DELETE FROM recipe_ingredients;

-- Delete from recipes
DELETE FROM recipes;

-- Delete from products
DELETE FROM products;

-- Delete from customers
DELETE FROM customers;

-- Delete from staff
DELETE FROM staff;

-- Delete from tables (restaurant tables)
DELETE FROM tables;

-- ============================================
-- RESET AUTO-INCREMENT SEQUENCES
-- ============================================

-- Reset all ID sequences to start from 1
ALTER SEQUENCE staff_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE tables_id_seq RESTART WITH 1;
ALTER SEQUENCE stock_movements_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE recipes_id_seq RESTART WITH 1;
ALTER SEQUENCE recipe_ingredients_id_seq RESTART WITH 1;
ALTER SEQUENCE customers_id_seq RESTART WITH 1;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that tables are empty (should return 0)
SELECT 
  (SELECT COUNT(*) FROM staff) as staff_count,
  (SELECT COUNT(*) FROM products) as products_count,
  (SELECT COUNT(*) FROM tables) as tables_count,
  (SELECT COUNT(*) FROM stock_movements) as stock_movements_count,
  (SELECT COUNT(*) FROM orders) as orders_count,
  (SELECT COUNT(*) FROM order_items) as order_items_count,
  (SELECT COUNT(*) FROM recipes) as recipes_count,
  (SELECT COUNT(*) FROM recipe_ingredients) as recipe_ingredients_count,
  (SELECT COUNT(*) FROM customers) as customers_count;

-- Check that categories are preserved (should show existing count)
SELECT COUNT(*) as categories_count FROM categories;

-- Check that user_profiles are preserved (should show existing count)
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
