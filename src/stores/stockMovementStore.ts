// CRUD for Stock Movements
import { create } from 'zustand';
import type { StockMovement } from '../types';
import { supabase } from '../lib/supabase';

interface StockMovementState {
  movements: (StockMovement & { product_name?: string })[];
  loading: boolean;
  error: string | null;

  fetchMovements: (productId?: number) => Promise<void>;
  addMovement: (movement: Omit<StockMovement, 'id'>) => Promise<boolean>;
  deleteMovement: (id: number) => Promise<void>;
}

export const useStockMovementStore = create<StockMovementState>((set) => ({
  movements: [],
  loading: false,
  error: null,

  fetchMovements: async (productId) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('stock_movements')
        .select('*, products(name, emoji)')
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with product name
      const enriched: (StockMovement & { product_name?: string })[] = (data || []).map((m: unknown) => {
        const row = m as Record<string, unknown>;
        const products = row.products as Record<string, unknown> | undefined;
        return {
          id: row.id as number | undefined,
          product_id: row.product_id as number,
          product_name: products?.name as string | undefined,
          movement_type: row.movement_type as StockMovement['movement_type'],
          quantity: row.quantity as number,
          unit: row.unit as string,
          reference: row.reference as string | undefined,
          notes: row.notes as string | undefined,
          cost_per_unit: row.cost_per_unit as number | undefined,
          total_cost: row.total_cost as number | undefined,
          created_by: row.created_by as string | undefined,
          created_at: row.created_at as string | undefined,
        };
      });
      set({ movements: enriched });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch movements' });
    } finally {
      set({ loading: false });
    }
  },

  addMovement: async (movement) => {
    set({ loading: true, error: null });
    try {
      // Build clean payload — explicitly exclude id and product_name
      const payload: Record<string, unknown> = {
        product_id: movement.product_id,
        movement_type: movement.movement_type,
        quantity: movement.quantity,
        unit: movement.unit,
      };
      if (movement.reference) payload.reference = movement.reference;
      if (movement.notes) payload.notes = movement.notes;
      if (movement.cost_per_unit) payload.cost_per_unit = movement.cost_per_unit;
      if (movement.total_cost) payload.total_cost = movement.total_cost;
      if (movement.created_by) payload.created_by = movement.created_by;

      // 1. Insert movement record
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;

      set((state) => ({ movements: [data, ...state.movements] }));

      // 3. Update product stock quantity
      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', movement.product_id)
        .single();

      if (fetchErr) throw new Error(`Could not find product: ${fetchErr.message}`);

      let newStock = product.stock_quantity;

      if (movement.movement_type === 'purchase' || movement.movement_type === 'return') {
        newStock = product.stock_quantity + movement.quantity;
      } else if (movement.movement_type === 'sale' || movement.movement_type === 'waste') {
        newStock = Math.max(0, product.stock_quantity - movement.quantity);
      } else if (movement.movement_type === 'adjustment') {
        newStock = movement.quantity; // sets exact value
      }

      const { error: updateErr } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', movement.product_id);

      if (updateErr) throw new Error(`Failed to update stock: ${updateErr.message}`);

      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add movement';
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteMovement: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('stock_movements').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ movements: state.movements.filter((m) => m.id !== id) }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete movement' });
    } finally {
      set({ loading: false });
    }
  },
}));
