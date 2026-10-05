import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Dish } from '../types'

export interface CartItem {
  dish: Dish
  quantity: number
}

interface CartState {
  items: CartItem[]
  tableNumber: number | null
  addItem: (dish: Dish, quantity?: number) => void
  removeItem: (dishId: number) => void
  updateQuantity: (dishId: number, quantity: number) => void
  clearCart: () => void
  setTableNumber: (tableNumber: number | null) => void
  getTotalItems: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,

      addItem: (dish: Dish, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.dish.id === dish.id)
          if (existingIndex >= 0) {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += quantity
            return { items: newItems }
          }
          return { items: [...state.items, { dish, quantity }] }
        })
      },

      removeItem: (dishId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.dish.id !== dishId),
        }))
      },

      updateQuantity: (dishId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(dishId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.dish.id === dishId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      setTableNumber: (tableNumber: number | null) => set({ tableNumber }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = parseFloat(item.dish.price)
          return sum + price * item.quantity
        }, 0)
      },
    }),
    {
      name: 'menu-digital-cart',
      // Only persist tableNumber, not items - items should be fresh each session
      partialize: (state) => ({
        tableNumber: state.tableNumber,
      }),
    }
  )
)