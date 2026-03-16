import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthModalTab, Theme } from 'types/auth';

// ─── Auth Modal Store ────────────────────────────────────────────────────────

interface AuthModalState {
  isOpen: boolean;
  activeTab: AuthModalTab;
  /** Where to redirect / what to do after login */
  redirectIntent?: string;
  openModal: (tab?: AuthModalTab, intent?: string) => void;
  closeModal: () => void;
  setTab: (tab: AuthModalTab) => void;
}

export const useAuthModalStore = create<AuthModalState>()((set) => ({
  isOpen: false,
  activeTab: 'login',
  redirectIntent: undefined,
  openModal: (tab = 'login', intent) =>
    set({ isOpen: true, activeTab: tab, redirectIntent: intent }),
  closeModal: () =>
    set({ isOpen: false, redirectIntent: undefined }),
  setTab: (tab) => set({ activeTab: tab }),
}));

// ─── Theme Store ─────────────────────────────────────────────────────────────

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        document.documentElement.setAttribute('data-theme', next);
      },
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
    }),
    {
      name: 'bookstore-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration (client only)
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
