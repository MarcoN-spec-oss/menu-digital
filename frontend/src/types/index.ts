export interface Category {
  id: number
  name: string
  slug: string
  description: string
  order: number
}

export interface Dish {
  id: number
  name: string
  slug: string
  description: string
  price: string
  category: Category
  category_id: number
  image: string | null
  image_url: string | null
  is_available: boolean
  order: number
}

export interface DishListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Dish[]
}

export interface CategoryListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Category[]
}

export interface OrderItem {
  id: number
  dish: Dish
  dish_id: number
  dish_name: string
  unit_price: string
  quantity: number
  subtotal: string
}

export interface Order {
  id: number
  user: number | null
  customer_name: string
  table_number: number
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCELLED'
  status_display: string
  notes: string
  total: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface OrderListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Order[]
}

export interface CreateOrderRequest {
  customer_name?: string
  table_number?: number
  notes?: string
  items: {
    dish_id: number
    quantity: number
  }[]
}

export interface Reservation {
  id: number
  user: number | null
  full_name: string
  phone: string
  email: string
  date: string
  time: string
  guests: number
  special_notes: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  status_display: string
  created_at: string
}

export interface ReservationListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Reservation[]
}

export interface CreateReservationRequest {
  full_name: string
  phone: string
  email?: string
  date: string
  time: string
  guests: number
  special_notes?: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  date_joined: string
}

export interface AuthResponse {
  user: User
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
}

export interface ApiError {
  detail?: string
  [key: string]: string | string[] | undefined
}