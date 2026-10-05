import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useCartStore = create()(persist((set, get) => ({
    items: [],
    tableNumber: null,
    addItem: (dish, quantity = 1) => {
        set((state) => {
            const existingIndex = state.items.findIndex((item) => item.dish.id === dish.id);
            if (existingIndex >= 0) {
                const newItems = [...state.items];
                newItems[existingIndex].quantity += quantity;
                return { items: newItems };
            }
            return { items: [...state.items, { dish, quantity }] };
        });
    },
    removeItem: (dishId) => {
        set((state) => ({
            items: state.items.filter((item) => item.dish.id !== dishId),
        }));
    },
    updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(dishId);
            return;
        }
        set((state) => ({
            items: state.items.map((item) => item.dish.id === dishId ? { ...item, quantity } : item),
        }));
    },
    clearCart: () => set({ items: [] }),
    setTableNumber: (tableNumber) => set({ tableNumber }),
    getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
    },
    getSubtotal: () => {
        return get().items.reduce((sum, item) => {
            const price = parseFloat(item.dish.price);
            return sum + price * item.quantity;
        }, 0);
    },
}), {
    name: 'menu-digital-cart',
    partialize: (state) => ({
        items: state.items,
        tableNumber: state.tableNumber,
    }),
}));
