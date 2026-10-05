import { useState } from 'react'
import { useReservations, useUpdateReservationStatus } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '../lib/utils'
import { Loader2, Calendar, Clock, Filter } from 'lucide-react'

const statusOptions = ['PENDING', 'CONFIRMED', 'CANCELLED'] as const

export function ManageReservationsPage() {
  const [currentStatus, setCurrentStatus] = useState<string>('')
  const { data: reservationsResponse, isLoading, error, refetch } = useReservations({
    status: currentStatus || undefined,
  })
  const updateStatus = useUpdateReservationStatus()

  const reservations = reservationsResponse?.results || []

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus })
    } catch {
      alert('Error al actualizar el estado')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
          </div>
          <Card className="animate-pulse">
            <CardContent className="py-8">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
            <p className="text-gray-600">{reservations.length} reserva{reservations.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCurrentStatus('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !currentStatus
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todas
              </button>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setCurrentStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    currentStatus === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {reservations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                <p>No hay reservas{filtroActivo ? ' con este filtro' : ''}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Teléfono</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Hora</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Pers.</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{reservation.full_name}</p>
                          {reservation.email && <p className="text-sm text-gray-500">{reservation.email}</p>}
                        </td>
                        <td className="py-4 px-4 text-gray-600">{reservation.phone}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(reservation.date)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {formatTime(reservation.time)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900">{reservation.guests}</td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(reservation.status)}>
                            {getStatusLabel(reservation.status)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {statusOptions
                              .filter((s) => s !== reservation.status)
                              .map((status) => (
                                <Button
                                  key={status}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(reservation.id, status)}
                                  loading={updateStatus.isPending && updateStatus.variables?.id === reservation.id}
                                >
                                  {getStatusLabel(status)}
                                </Button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const filtroActivo = false