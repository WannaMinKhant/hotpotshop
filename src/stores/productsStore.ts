// CRUD for Products
import { create } from 'zustand';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      set({ products: data || [] });
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (newProduct) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ products: [...state.products, data] }));
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }));
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    } catch (e: any) {
    } finally {
      set({ loading: false });
    }
  },
}));
