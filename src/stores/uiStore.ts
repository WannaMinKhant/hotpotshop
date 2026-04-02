// zustand store for UI state
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Dashboard UI Store (sidebar, theme, modals)
interface DashboardUIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  openModal: string | null;
  setOpenModal: (modal: string | null) => void;
}

export const useDashboardUI = create<DashboardUIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  currentPath: 'dashboard',
  setCurrentPath: (path) => set({ currentPath: path }),
  openModal: null,
  setOpenModal: (modal) => set({ openModal: modal }),
}));
