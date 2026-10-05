import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useOrder } from '../hooks/useApi'
import { Button } from '../components/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/Card'
import { Badge } from '../components/Badge'
import { formatPrice, formatDateTime, getStatusColor, getStatusLabel, cn } from '../lib/utils'
import { CheckCircle, Truck, Clock, AlertCircle } from 'lucide-react'

export function OrderConfirmationPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [showSuccess, setShowSuccess] = useState(false)

  const orderIdNum = orderId ? parseInt(orderId, 10) : null
  const { data: order, isLoading, error } = useOrder(orderIdNum || 0)

  useEffect(() => {
    if (location.state?.orderConfirmed) {
      setShowSuccess(true)
    }
  }, [location.state])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center py-12">
          <AlertCircle className="mx-auto w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido no encontrado</h2>
          <p className="text-gray-500 mb-6">No se pudo cargar la información del pedido</p>
          <Button onClick={() => navigate('/menu')}>Volver al menú</Button>
        </Card>
      </div>
    )
  }

  const statusIcons = {
    PENDING: <Clock className="h-5 w-5 text-yellow-600" />,
    PREPARING: <Truck className="h-5 w-5 text-blue-600" />,
    SERVED: <CheckCircle className="h-5 w-5 text-green-600" />,
    PAID: <CheckCircle className="h-5 w-5 text-purple-600" />,
    CANCELLED: <AlertCircle className="h-5 w-5 text-red-600" />,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {showSuccess && (
          <div className="mb-6 animate-fade-in">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">¡Pedido enviado a cocina!</p>
                  <p className="text-sm text-green-700">Tu pedido ha sido recibido y está siendo procesado</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.id}</h1>
                <p className="text-gray-600">Mesa {order.table_number} • {formatDateTime(order.created_at)}</p>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(order.status)}>
                  {statusIcons[order.status as keyof typeof statusIcons]}
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.dish_name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}

              {order.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Observaciones:</strong> {order.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => navigate('/menu')}>
                Volver al menú
              </Button>
              <Button onClick={() => navigate('/my-orders')}>
                Ver mis pedidos
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Estado del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['PENDING', 'PREPARING', 'SERVED', 'PAID'].map((status) => (
                  <div
                    key={status}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg transition-colors',
                      order.status === status
                        ? 'bg-primary-50 border-2 border-primary-200'
                        : order.status === 'CANCELLED'
                        ? 'bg-gray-50'
                        : ['PENDING', 'PREPARING', 'SERVED', 'PAID'].indexOf(order.status) >
                          ['PENDING', 'PREPARING', 'SERVED', 'PAID'].indexOf(status)
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        order.status === status
                          ? 'bg-primary-600 text-white'
                          : order.status === 'CANCELLED'
                          ? 'bg-gray-300 text-gray-500'
                          : ['PENDING', 'PREPARING', 'SERVED', 'PAID'].indexOf(order.status) >
                            ['PENDING', 'PREPARING', 'SERVED', 'PAID'].indexOf(status)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      )}
                    >
                      {statusIcons[status as keyof typeof statusIcons]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getStatusLabel(status)}</p>
                      <p className="text-sm text-gray-500">
                        {status === 'PENDING' && 'Tu pedido ha sido recibido'}
                        {status === 'PREPARING' && 'La cocina está preparando tu pedido'}
                        {status === 'SERVED' && 'Tu pedido está listo para servir'}
                        {status === 'PAID' && 'Pedido completado y pagado'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}