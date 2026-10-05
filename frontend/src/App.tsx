import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { MenuPage } from './pages/MenuPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { MyOrdersPage } from './pages/MyOrdersPage'
import { MyReservationsPage } from './pages/MyReservationsPage'
import { CreateReservationPage } from './pages/CreateReservationPage'
import { KitchenPage } from './pages/KitchenPage'
import { ManageReservationsPage } from './pages/ManageReservationsPage'
import { ProtectedRoute, StaffRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MenuPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order/:orderId/confirmation" element={<OrderConfirmationPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="my-orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-reservations"
          element={
            <ProtectedRoute>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="reserve" element={<CreateReservationPage />} />
        <Route
          path="kitchen"
          element={
            <StaffRoute>
              <KitchenPage />
            </StaffRoute>
          }
        />
        <Route
          path="manage-reservations"
          element={
            <StaffRoute>
              <ManageReservationsPage />
            </StaffRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App