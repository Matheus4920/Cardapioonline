import { create } from 'zustand';

export interface AddOn {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type?: string[];
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
  removableIngredients?: string[];
  addOns?: AddOn[];
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  removedIngredients?: string[];
  selectedAddOns?: AddOn[];
  notes?: string;
}

interface User {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  favorites?: string[];
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  cart: [],
  addToCart: (item) =>
    set((state) => {
      // Check if an identical item exists (same product, same modifications)
      const existingItemIndex = state.cart.findIndex(
        (cartItem) => 
          cartItem.id === item.id && 
          JSON.stringify(cartItem.removedIngredients || []) === JSON.stringify(item.removedIngredients || []) &&
          JSON.stringify(cartItem.selectedAddOns || []) === JSON.stringify(item.selectedAddOns || []) &&
          cartItem.notes === item.notes
      );

      if (existingItemIndex >= 0) {
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += item.quantity;
        return { cart: newCart, isCartOpen: true };
      }
      return { cart: [...state.cart, item], isCartOpen: true };
    }),
  removeFromCart: (cartItemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
    })),
  updateQuantity: (cartItemId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    })),
  clearCart: () => set({ cart: [] }),
  isCartOpen: false,
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
}));
