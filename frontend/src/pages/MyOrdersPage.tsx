import { Link } from 'react-router-dom'
import { useMyOrders } from '../hooks/useApi'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/Card'
import { Badge } from '../components/Badge'
import { formatPrice, formatDateTime, getStatusColor, getStatusLabel } from '../lib/utils'
import { Clock, Truck, CheckCircle, Utensils } from 'lucide-react'

export function MyOrdersPage() {
  const { data: orders, isLoading, error, refetch } = useMyOrders()

  const statusIcons = {
    PENDING: <Clock className="h-4 w-4" />,
    PREPARING: <Truck className="h-4 w-4" />,
    SERVED: <CheckCircle className="h-4 w-4" />,
    PAID: <CheckCircle className="h-4 w-4" />,
    CANCELLED: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-6 bg-gray-200 rounded w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-4xl text-center py-12">
          <Utensils className="mx-auto w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No se pudieron cargar los pedidos</h2>
          <p className="text-gray-500 mb-6">Intenta nuevamente más tarde</p>
          <button onClick={() => refetch()} className="text-primary-600 hover:text-primary-500 font-medium">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        </div>

        {orders && orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Utensils className="mx-auto w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes pedidos aún</h2>
              <p className="text-gray-500 mb-6">Cuando hagas un pedido, aparecerá aquí</p>
              <Link to="/menu">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
                  <Utensils className="h-5 w-5" />
                  Ver el menú
                </button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders?.map((order) => (
              <Card key={order.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary-100 rounded-xl">
                        <Utensils className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">Pedido #{order.id}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {statusIcons[order.status as keyof typeof statusIcons]}
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Mesa {order.table_number} • {formatDateTime(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:ml-auto">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
                        <p className="text-sm text-gray-500">{order.items.length} {order.items.length === 1 ? 'platillo' : 'platillos'}</p>
                      </div>
                      <Link
                        to={`/order/${order.id}/confirmation`}
                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500">{item.quantity}x</span>
                          <span className="font-medium text-gray-900 truncate">{item.dish_name}</span>
                          <span className="text-gray-500">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{order.items.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}