import { Link } from 'react-router-dom'
import { useMyReservations, useCancelReservation } from '../hooks/useApi'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '../lib/utils'
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react'

export function MyReservationsPage() {
  const { data: reservations, isLoading, error, refetch } = useMyReservations()
  const cancelMutation = useCancelReservation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Reservas</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleCancel = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return

    try {
      await cancelMutation.mutateAsync({ id })
    } catch {
      alert('Error al cancelar la reserva')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
        </div>

        {reservations && reservations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="mx-auto w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes reservas</h2>
              <p className="text-gray-500 mb-6">Cuando hagas una reserva, aparecerá aquí</p>
              <Link to="/reserve">
                <Button>Crear reserva</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations?.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary-100 rounded-xl">
                        <Calendar className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {reservation.guests} {reservation.guests === 1 ? 'persona' : 'personas'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(reservation.date)} a las {formatTime(reservation.time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:ml-auto">
                      <Badge className={getStatusColor(reservation.status)}>
                        {getStatusLabel(reservation.status)}
                      </Badge>
                      {reservation.status !== 'CANCELLED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(reservation.id)}
                          loading={cancelMutation.isPending && cancelMutation.variables?.id === reservation.id}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>

                  {reservation.special_notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <strong>Notas:</strong> {reservation.special_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}