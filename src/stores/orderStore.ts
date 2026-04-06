// CRUD for Orders
import { create } from 'zustand';
import type { Order, OrderItem } from '../types';
import { supabase } from '../lib/supabase';
import { useRecipeStore } from './recipeStore';
import { useNotificationStore } from './notificationStore';

interface OrderState {
  orders: (Order & { items?: OrderItem[] })[];
  loading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  addOrder: (newOrder: Omit<Order, 'id' | 'order_number'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) => Promise<string>;
  addItemsToOrder: (orderId: number, items: Omit<OrderItem, 'id' | 'order_id'>[]) => Promise<boolean>;
  updateOrderItemStatus: (orderItemId: number, status: 'pending' | 'preparing' | 'ready' | 'served') => Promise<void>;
  removeOrderItem: (orderItemId: number, orderId: number) => Promise<void>;
  updateOrder: (id: number, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
}

// Generate unique order number: ORD-YYYYMMDD-XXX
function generateOrderNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `ORD-${date}-${seq}`;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Normalize: Supabase returns joined data under 'order_items', map it to 'items'
      const normalized = (data || []).map((order: Record<string, unknown>) => {
        const { order_items, ...rest } = order;
        return {
          ...rest,
          items: (order_items as unknown) || [],
        } as Order & { items?: OrderItem[] };
      });
      set({ orders: normalized });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch orders' });
    } finally {
      set({ loading: false });
    }
  },

  addOrder: async (newOrder, items) => {
    set({ loading: true, error: null });
    try {
      const orderNumber = generateOrderNumber();

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ ...newOrder, order_number: orderNumber }])
        .select()
        .single();
      if (orderError) throw orderError;

      if (items.length > 0) {
        const itemsWithOrderId = items.map((item) => ({
          ...item,
          order_id: orderData.id,
          status: item.status || 'pending',
        }));
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsWithOrderId);
        if (itemsError) throw itemsError;

        // Record stock movements for each item sold
        const movementRecords = items.map((item) => ({
          product_id: item.product_id,
          movement_type: 'sale' as const,
          quantity: item.quantity,
          unit: 'pcs',
          reference: orderNumber,
          notes: `Order ${orderNumber}`,
        }));
        await supabase.from('stock_movements').insert(movementRecords);

        // Deduct stock for each item
        for (const item of items) {
          // Check if product_id refers to a recipe (product_id > 100000 = recipe ID convention)
          const isRecipe = item.product_id > 100000;

          if (isRecipe) {
            const recipeId = item.product_id - 100000;
            await useRecipeStore.getState().deductIngredients(recipeId, item.quantity);
          } else {
            // Regular product — deduct stock directly
            const { data: product } = await supabase
              .from('products')
              .select('stock_quantity')
              .eq('id', item.product_id)
              .single();
            if (product) {
              await supabase
                .from('products')
                .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
                .eq('id', item.product_id);
            }
          }
        }
      }

      const enrichedOrder = { ...orderData, items };
      set((state) => ({ orders: [enrichedOrder, ...state.orders] }));
      return orderNumber;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to add order' });
      return '';
    } finally {
      set({ loading: false });
    }
  },

  updateOrder: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
      }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update order' });
    } finally {
      set({ loading: false });
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await supabase.from('order_items').delete().eq('order_id', id);
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete order' });
    } finally {
      set({ loading: false });
    }
  },

  addItemsToOrder: async (orderId, items) => {
    set({ loading: true, error: null });
    try {
      // Get current order status before adding items
      const { data: orderBefore } = await supabase
        .from('orders')
        .select('status, order_number')
        .eq('id', orderId)
        .single();

      const orderStatus = orderBefore?.status || 'pending';
      const orderNumber = orderBefore?.order_number || '';

      // Insert new order items with status='pending'
      const itemsWithOrderId = items.map(item => ({
        ...item,
        order_id: orderId,
        status: item.status || 'pending',
      }));
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId);
      if (itemsError) throw itemsError;

      // Record stock movements and deduct stock
      const movementRecords = items.map(item => ({
        product_id: item.product_id,
        movement_type: 'sale' as const,
        quantity: item.quantity,
        unit: 'pcs',
        reference: orderNumber,
        notes: `Added to order ${orderNumber}`,
      }));
      await supabase.from('stock_movements').insert(movementRecords);

      // Deduct stock for each item
      for (const item of items) {
        const isRecipe = item.product_id > 100000;
        if (isRecipe) {
          const recipeId = item.product_id - 100000;
          await useRecipeStore.getState().deductIngredients(recipeId, item.quantity);
        } else {
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();
          if (product) {
            await supabase
              .from('products')
              .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
              .eq('id', item.product_id);
          }
        }
      }

      // Recalculate order totals
      const { data: allItems } = await supabase
        .from('order_items')
        .select('subtotal')
        .eq('order_id', orderId);

      const newTotal = allItems?.reduce((sum: number, i: { subtotal: number }) => sum + i.subtotal, 0) || 0;
      const newSubtotal = newTotal / 1.1;
      const newTax = newTotal - newSubtotal;

      await supabase
        .from('orders')
        .update({
          subtotal: newSubtotal,
          tax_amount: newTax,
          total: newTotal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Refresh orders
      await get().fetchOrders();

      // If order was already in kitchen workflow (not pending), alert kitchen about new items
      // We now track individual item IDs instead of order IDs
      if (orderStatus !== 'pending') {
        // After fetchOrders completes, we can get the IDs of newly added items
        const { data: newItems } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', orderId)
          .eq('status', 'pending')
          .order('id', { ascending: false })
          .limit(items.length);

        if (newItems) {
          newItems.forEach(item => {
            useNotificationStore.getState().addNewItemId(item.id);
          });
        }
      }

      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to add items' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateOrderItemStatus: async (orderItemId, status) => {
    set({ loading: true, error: null });
    try {
      // First, get the order_id for this item
      const { data: itemData } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('id', orderItemId)
        .single();

      const { error } = await supabase
        .from('order_items')
        .update({ status })
        .eq('id', orderItemId);
      if (error) throw error;

      // Check if all items in this order are now 'served'
      if (itemData && status === 'served') {
        const { data: allItems } = await supabase
          .from('order_items')
          .select('status')
          .eq('order_id', itemData.order_id);

        const allServed = allItems?.every(item => item.status === 'served');
        if (allServed) {
          // Auto-update order status to 'served'
          await supabase
            .from('orders')
            .update({ status: 'served', updated_at: new Date().toISOString() })
            .eq('id', itemData.order_id);
        }
      }

      // Refresh orders to reflect item status changes
      await get().fetchOrders();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update item status' });
    } finally {
      set({ loading: false });
    }
  },

  removeOrderItem: async (orderItemId, orderId) => {
    set({ loading: true, error: null });
    try {
      // Get the item details before deletion
      const { data: itemData } = await supabase
        .from('order_items')
        .select('product_id, quantity, product_name, subtotal')
        .eq('id', orderItemId)
        .single();

      if (!itemData) throw new Error('Item not found');

      // Delete the order item
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', orderItemId);
      if (error) throw error;

      // Return stock back to product (reverse the deduction)
      if (itemData.product_id <= 100000) {
        // Regular product — add stock back
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', itemData.product_id)
          .single();
        
        if (product) {
          await supabase
            .from('products')
            .update({ 
              stock_quantity: product.stock_quantity + itemData.quantity 
            })
            .eq('id', itemData.product_id);

          // Record a return movement to track this stock addition
          await supabase
            .from('stock_movements')
            .insert([{
              product_id: itemData.product_id,
              movement_type: 'return',
              quantity: itemData.quantity,
              unit: 'pcs',
              reference: `Item removed from order`,
              notes: `Item "${itemData.product_name}" removed, stock returned`,
            }]);
        }
      }

      // Recalculate order totals
      const { data: allItems } = await supabase
        .from('order_items')
        .select('subtotal')
        .eq('order_id', orderId);

      const newTotal = allItems?.reduce((sum: number, i: { subtotal: number }) => sum + i.subtotal, 0) || 0;
      const newSubtotal = newTotal / 1.1;
      const newTax = newTotal - newSubtotal;

      // Update order totals
      await supabase
        .from('orders')
        .update({
          subtotal: newSubtotal,
          tax_amount: newTax,
          total: newTotal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // If order has no more items and was in kitchen workflow, consider cancelling it
      if (allItems?.length === 0) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', orderId);
      }

      // Refresh orders to reflect the changes
      await get().fetchOrders();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to remove order item' });
    } finally {
      set({ loading: false });
    }
  },
}));
