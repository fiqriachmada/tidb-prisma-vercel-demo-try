import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthModalTab, Theme } from 'types/auth';
import type { shoppingCartItemProps } from 'const';
import { PAGE_SIZE } from 'const';

// ─── Auth Modal Store ────────────────────────────────────────────────────────

interface AuthModalState {
  isOpen: boolean;
  activeTab: AuthModalTab;
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
  closeModal: () => set({ isOpen: false, redirectIntent: undefined }),
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
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);

// ─── Shopping Cart Store (replaces Recoil shoppingCartState) ─────────────────

interface CartState {
  cart: shoppingCartItemProps[];
  addItem: (item: shoppingCartItemProps) => string; // returns 'added' | 'updated' | 'maxstock'
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addItem: (item) => {
        const existing = get().cart.find((i) => i.id === item.id);
        if (existing) {
          if (existing.quantity >= item.stock) return 'maxstock';
          set((s) => ({
            cart: s.cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }));
          return 'updated';
        }
        set((s) => ({ cart: [...s.cart, { ...item, quantity: 1 }] }));
        return 'added';
      },
      removeItem: (id) =>
        set((s) => ({ cart: s.cart.filter((i) => i.id !== id) })),
      updateQuantity: (id, qty) =>
        set((s) => ({
          cart: s.cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'bookstore-cart' }
  )
);

// ─── Home Page Query Store (replaces Recoil homePageQueryState) ───────────────

export interface HomePageQuery {
  page: number;
  type: string;
  sort: string;
  size: number;
}

interface HomePageQueryState {
  query: HomePageQuery;
  setQuery: (q: Partial<HomePageQuery>) => void;
}

export const useHomePageQueryStore = create<HomePageQueryState>()((set) => ({
  query: { page: 1, type: '', sort: '', size: PAGE_SIZE },
  setQuery: (q) => set((s) => ({ query: { ...s.query, ...q } })),
}));

// ─── Book Details Store (replaces Recoil bookDetailsIdState) ──────────────────

interface BookDetailsState {
  bookId: string;
  setBookId: (id: string) => void;
}

export const useBookDetailsStore = create<BookDetailsState>()((set) => ({
  bookId: '',
  setBookId: (id) => set({ bookId: id }),
}));
