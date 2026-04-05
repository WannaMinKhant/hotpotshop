// Store for managing product categories and subcategories
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Category {
  id?: number;
  name: string;
  parent_id?: number | null;
  emoji?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  // Derived
  children?: Category[];
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (cat: Omit<Category, 'id'>) => Promise<boolean>;
  updateCategory: (id: number, updates: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;

      // Build tree structure
      const items: Category[] = (data || []).map(d => ({
        ...d,
        parent_id: d.parent_id ?? null,
      }));

      // Attach children to parents
      const tree: Category[] = items.filter(cat => !cat.parent_id).map(parent => ({
        ...parent,
        children: items.filter(child => child.parent_id === parent.id),
      }));

      set({ categories: tree });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch categories' });
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (cat) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ ...cat, parent_id: cat.parent_id || null }])
        .select()
        .single();
      if (error) throw error;
      await get().fetchCategories();
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to add category' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateCategory: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('categories')
        .update({ ...updates, parent_id: updates.parent_id || null })
        .eq('id', id);
      if (error) throw error;
      await get().fetchCategories();
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update category' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await get().fetchCategories();
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete category' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
