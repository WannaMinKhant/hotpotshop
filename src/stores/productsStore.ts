/* eslint-disable @typescript-eslint/no-unused-vars */
// CRUD for Products + Search
import { create } from "zustand";
import type { Product } from "../types";
import { supabase } from "../lib/supabase";

interface ProductState {
  products: Product[];
  search: string;
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  addProduct: (newProduct: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  updateStock: (id: number, newStock: number) => Promise<void>;
  updateReorderPoint: (id: number, newPoint: number) => Promise<void>;
  setSearch: (term: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  search: "",
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("category", { ascending: true });
      if (error) throw error;
      set({ products: data || [] });
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : "Failed to fetch products",
      });
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (newProduct) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ products: [...state.products, data] }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Failed to add product" });
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null });

    const { id: _, ...updateData } = updates;

    try {
      const { data, error } = await supabase
        .from("products")
        .update(updateData) // id မပါတဲ့ updateData ကိုပဲ ပို့ပါ
        .eq("id", id) // filter ထဲမှာပဲ id ကို သုံးပါ
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...data } : p,
        ),
      }));
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : "Failed to update product",
      });
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : "Failed to delete product",
      });
    } finally {
      set({ loading: false });
    }
  },

  updateStock: async (id, newStock) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", id);
      if (error) throw error;
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, stock_quantity: newStock } : p,
        ),
      }));
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Failed to update stock" });
    }
  },

  updateReorderPoint: async (id, newPoint) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ reorder_point: newPoint })
        .eq("id", id);
      if (error) throw error;
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, reorder_point: newPoint } : p,
        ),
      }));
    } catch (e: unknown) {
      set({
        error:
          e instanceof Error ? e.message : "Failed to update reorder point",
      });
    }
  },

  setSearch: (term) => set({ search: term }),
}));
