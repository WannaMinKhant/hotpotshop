import { create } from 'zustand';

export interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  reorderPoint: number;
  price: number;
  emoji: string;
}

interface ProductState {
  products: Product[];
  search: string;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, updates: Partial<Omit<Product, 'id'>>) => void;
  updateStock: (id: number, newStock: number) => void;
  updateReorderPoint: (id: number, newPoint: number) => void;
  deleteProduct: (id: number) => void;
  setSearch: (term: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [
    { id: 1, name: 'Spicy Hotpot Base', category: 'bases', stock: 15, unit: 'pouches', reorderPoint: 20, price: 12, emoji: '🌶️' },
    { id: 2, name: 'Herbal Hotpot Base', category: 'bases', stock: 30, unit: 'pouches', reorderPoint: 15, price: 10, emoji: '🍲' },
    { id: 3, name: 'Beef Slices', category: 'meats', stock: 8, unit: 'kg', reorderPoint: 10, price: 18, emoji: '🥩' },
    { id: 4, name: 'Lamb Rolls', category: 'meats', stock: 12, unit: 'kg', reorderPoint: 10, price: 16, emoji: '🐑' },
    { id: 5, name: 'Shrimp', category: 'seafood', stock: 25, unit: 'kg', reorderPoint: 5, price: 12, emoji: '🦐' },
    { id: 6, name: 'Napa Cabbage', category: 'veggies', stock: 20, unit: 'bunches', reorderPoint: 10, price: 4, emoji: '🥬' },
    { id: 7, name: 'Tofu', category: 'veggies', stock: 50, unit: 'blocks', reorderPoint: 30, price: 3, emoji: '🧈' },
    { id: 8, name: 'Glass Noodles', category: 'noodles', stock: 10, unit: 'packs', reorderPoint: 20, price: 4, emoji: '🍜' },
  ],
  search: '',
  
  addProduct: (product) => set((state) => ({
    products: [...state.products, { ...product, id: Math.max(...state.products.map(p => p.id)) + 1 }]
  })),
  
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p))
  })),
  
  updateStock: (id, newStock) => set((state) => ({
    products: state.products.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
  })),
  
  updateReorderPoint: (id, newPoint) => set((state) => ({
    products: state.products.map((p) => (p.id === id ? { ...p, reorderPoint: newPoint } : p))
  })),
  
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id)
  })),
  
  setSearch: (term) => set({ search: term }),
}));
