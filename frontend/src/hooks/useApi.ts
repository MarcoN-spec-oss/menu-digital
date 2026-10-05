import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type {
  Category,
  Dish,
  DishListResponse,
  CategoryListResponse,
  Order,
  OrderListResponse,
  CreateOrderRequest,
  Reservation,
  ReservationListResponse,
  CreateReservationRequest,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../types'

// Categories
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<CategoryListResponse>('/categories/')
      return response.data.results
    },
  })
}

// Dishes
export function useDishes(params?: {
  category?: string
  search?: string
  ordering?: string
  page?: number
}) {
  return useQuery<DishListResponse>({
    queryKey: ['dishes', params],
    queryFn: async () => {
      const response = await api.get<DishListResponse>('/dishes/', { params })
      return response.data
    },
  })
}

export function useDish(id: number) {
  return useQuery<Dish>({
    queryKey: ['dishes', id],
    queryFn: async () => {
      const response = await api.get<Dish>(`/dishes/${id}/`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useFeaturedDishes() {
  return useQuery<Dish[]>({
    queryKey: ['dishes', 'featured'],
    queryFn: async () => {
      const response = await api.get<Dish[]>('/dishes/featured/')
      return response.data
    },
  })
}

// Orders
export function useOrders(params?: {
  status?: string
  page?: number
}) {
  return useQuery<OrderListResponse>({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await api.get<OrderListResponse>('/orders/', { params })
      return response.data
    },
  })
}

export function useMyOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders', 'my'],
    queryFn: async () => {
      const response = await api.get<Order[]>('/orders/my_orders/')
      return response.data
    },
  })
}

export function useOrder(id: number) {
  return useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await api.get<Order>(`/orders/${id}/`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation<Order, Error, CreateOrderRequest>({
    mutationFn: async (data) => {
      const response = await api.post<Order>('/orders/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation<Order, Error, { id: number; status: string }>({
    mutationFn: async ({ id, status }) => {
      const response = await api.post<Order>(`/orders/${id}/set_status/`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['kitchen'] })
    },
  })
}

// Kitchen
export function useKitchenOrders() {
  return useQuery<{ pending: Order[]; preparing: Order[] }>({
    queryKey: ['kitchen'],
    queryFn: async () => {
      const [pendingRes, preparingRes] = await Promise.all([
        api.get<Order[]>('/kitchen/pending/'),
        api.get<Order[]>('/kitchen/preparing/'),
      ])
      return {
        pending: pendingRes.data,
        preparing: preparingRes.data,
      }
    },
    refetchInterval: 30000,
  })
}

// Reservations
export function useReservations(params?: {
  status?: string
  page?: number
}) {
  return useQuery<ReservationListResponse>({
    queryKey: ['reservations', params],
    queryFn: async () => {
      const response = await api.get<ReservationListResponse>('/reservations/', { params })
      return response.data
    },
  })
}

export function useMyReservations() {
  return useQuery<Reservation[]>({
    queryKey: ['reservations', 'my'],
    queryFn: async () => {
      const response = await api.get<Reservation[]>('/reservations/my_reservations/')
      return response.data
    },
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation<Reservation, Error, CreateReservationRequest>({
    mutationFn: async (data) => {
      const response = await api.post<Reservation>('/reservations/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations', 'my'] })
    },
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()

  return useMutation<Reservation, Error, { id: number; email?: string; phone?: string }>({
    mutationFn: async ({ id, email, phone }) => {
      const response = await api.post<Reservation>(`/reservations/${id}/cancel/`, {
        email,
        phone,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations', 'my'] })
    },
  })
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient()

  return useMutation<Reservation, Error, { id: number; status: string }>({
    mutationFn: async ({ id, status }) => {
      const response = await api.post<Reservation>(`/reservations/${id}/set_status/`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}

// Auth
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (data) => {
      const response = await api.post<AuthResponse>('/auth/login/', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user)
    },
  })
}

export function useRegister() {
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (data) => {
      const response = await api.post<AuthResponse>('/auth/register/', data)
      return response.data
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.post('/auth/logout/')
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await api.get<User>('/auth/me/')
      return response.data
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  })
}