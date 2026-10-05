import { useEffect, useState } from 'react'
import { useKitchenOrders, useUpdateOrderStatus } from '../hooks/useApi'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { formatPrice, formatDateTime, getStatusColor, getStatusLabel } from '../lib/utils'
import { Clock, Truck, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

export function KitchenPage() {
  const { data: kitchenData, isLoading, error, refetch } = useKitchenOrders()
  const updateStatus = useUpdateOrderStatus()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus })
    } catch {
      alert('Error al actualizar el estado')
    }
  }

  const pendingOrders = kitchenData?.pending || []
  const preparingOrders = kitchenData?.preparing || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Cocina</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-pulse">
              <CardContent className="py-8">
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardContent className="py-8">
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const statusIcons = {
    PENDING: <Clock className="h-4 w-4" />,
    PREPARING: <Truck className="h-4 w-4" />,
    SERVED: <CheckCircle className="h-4 w-4" />,
  }

  const statusActions = {
    PENDING: { next: 'PREPARING', label: 'Empezar a preparar', variant: 'primary' as const },
    PREPARING: { next: 'SERVED', label: 'Marcar servido', variant: 'primary' as const },
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Cocina</h1>
            <p className="text-gray-600">
              Se actualiza automáticamente cada 30s • Última actualización: {lastUpdate?.toLocaleTimeString() || '—'}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pendientes
                <Badge variant="warning">{pendingOrders.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                  <p>Sin pedidos pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <KitchenOrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      statusIcons={statusIcons}
                      statusActions={statusActions}
                      isUpdating={updateStatus.isPending && updateStatus.variables?.id === order.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                En preparación
                <Badge variant="info">{preparingOrders.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {preparingOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Truck className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                  <p>Nada en preparación</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {preparingOrders.map((order) => (
                    <KitchenOrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      statusIcons={statusIcons}
                      statusActions={statusActions}
                      isUpdating={updateStatus.isPending && updateStatus.variables?.id === order.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function KitchenOrderCard({
  order,
  onStatusChange,
  statusIcons,
  statusActions,
  isUpdating,
}: {
  order: { id: number; table_number: number; customer_name: string; notes: string; items: { quantity: number; dish_name: string }[]; created_at: string; status: string }
  onStatusChange: (orderId: number, status: string) => void
  statusIcons: Record<string, React.ReactNode>
  statusActions: Record<string, { next: string; label: string; variant: 'primary' | 'outline' }>
  isUpdating: boolean
}) {
  const action = statusActions[order.status as keyof typeof statusActions]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span>Mesa {order.table_number}</span>
            <Badge variant="outline">#{order.id}</Badge>
          </div>
          {order.customer_name && (
            <p className="text-sm text-gray-500 mt-1">Cliente: {order.customer_name}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Hace unos momentos</p>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {statusIcons[order.status as keyof typeof statusIcons]}
          {getStatusLabel(order.status)}
        </Badge>
      </div>

      <ul className="space-y-2 mb-3">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3 text-sm">
            <span className="px-2 py-0.5 bg-gray-100 rounded font-medium">{item.quantity}x</span>
            <span className="font-medium text-gray-900">{item.dish_name}</span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <strong>Nota:</strong> {order.notes}
          </p>
        </div>
      )}

      {action && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Button
            variant={action.variant}
            size="sm"
            className="flex-1"
            onClick={() => onStatusChange(order.id, action.next)}
            loading={isUpdating}
          >
            {action.label}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onStatusChange(order.id, 'CANCELLED')}
            loading={isUpdating}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}