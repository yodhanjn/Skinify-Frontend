import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, UserSession } from '../types'

export interface CartItem extends Product {
  quantity: number
  selectedModel: string
}

interface SkinifyStore {
  cart: CartItem[]
  isCartOpen: boolean
  promoCode: string
  promoDiscount: number
  user: UserSession | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  searchQuery: string
  addToCart: (product: Product, selectedModel?: string) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: (value?: boolean) => void
  applyPromo: (code: string) => void
  removePromo: () => void
  login: (payload: { token?: string; refreshToken?: string; user?: UserSession | null }) => void
  logout: () => void
  setSearchQuery: (q: string) => void
}

const PROMO_CODES: Record<string, number> = {
  SKINIFY20: 0.2,
  WELCOME10: 0.1,
  PREMIUM15: 0.15,
}

export const useStore = create<SkinifyStore>()(
  persist(
    (set) => ({
      cart: [],
      isCartOpen: false,
      promoCode: '',
      promoDiscount: 0,
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      searchQuery: '',

      addToCart: (product, selectedModel = product.compatibleModels[0]) =>
        set((state) => {
          const existing = state.cart.find(
            (item) => item.id === product.id && item.selectedModel === selectedModel,
          )
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id && item.selectedModel === selectedModel
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            }
          }
          return { cart: [...state.cart, { ...product, quantity: 1, selectedModel }] }
        }),

      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart
            .map((item) => (item.id === id ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ cart: [], promoCode: '', promoDiscount: 0 }),

      toggleCart: (value) => set((state) => ({ isCartOpen: value ?? !state.isCartOpen })),

      applyPromo: (code) =>
        set(() => {
          const upper = code.toUpperCase().trim()
          const discount = PROMO_CODES[upper]
          if (discount) return { promoCode: upper, promoDiscount: discount }
          return { promoCode: '', promoDiscount: 0 }
        }),

      removePromo: () => set({ promoCode: '', promoDiscount: 0 }),

      login: (payload) =>
        set({
          token: payload.token ?? null,
          refreshToken: payload.refreshToken ?? null,
          user: payload.user ?? null,
          isAuthenticated: Boolean(payload.token),
        }),

      logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),

      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: 'skinify-store',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
      }),
    },
  ),
)
