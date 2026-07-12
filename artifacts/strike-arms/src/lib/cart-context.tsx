import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { CartItem } from '@/types/cart';

type CartState = {
  items: CartItem[];
  isDrawerOpen: boolean;
};

type AddItemInput = Omit<CartItem, 'quantity'>;

type Action =
  | { type: 'ADD_ITEM'; item: AddItemInput }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'SET_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' };

type CartContextValue = {
  items: CartItem[];
  addItem: (item: AddItemInput) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalCents: number;
  isDrawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'strike-arms-cart';

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.productId === action.item.productId);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === action.item.productId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.productId !== action.productId) };
    case 'SET_QTY':
      if (action.quantity < 1) {
        return { ...state, items: state.items.filter(i => i.productId !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.productId ? { ...i, quantity: action.quantity } : i,
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'OPEN_DRAWER':
      return { ...state, isDrawerOpen: true };
    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false };
    default:
      return state;
  }
}

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: loadFromStorage(),
    isDrawerOpen: false,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalCents = state.items.reduce(
    (sum, i) => sum + (i.salePriceCents ?? i.priceCents) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem: (item) => dispatch({ type: 'ADD_ITEM', item }),
      removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
      setQuantity: (productId, quantity) => dispatch({ type: 'SET_QTY', productId, quantity }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      itemCount,
      totalCents,
      isDrawerOpen: state.isDrawerOpen,
      openCart: () => dispatch({ type: 'OPEN_DRAWER' }),
      closeCart: () => dispatch({ type: 'CLOSE_DRAWER' }),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
