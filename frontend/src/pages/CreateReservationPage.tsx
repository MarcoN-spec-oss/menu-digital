import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateReservation } from '../hooks/useApi'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/Card'
import { Input } from '../components/Input'
import { formatPrice } from '../lib/utils'
import { Loader2, Calendar, Clock, Users, Utensils } from 'lucide-react'

export function CreateReservationPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const createReservation = useCreateReservation()

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: 2,
    special_notes: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const minDate = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.full_name.trim()) errors.full_name = 'El nombre es obligatorio'
    if (!formData.phone.trim()) errors.phone = 'El teléfono es obligatorio'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Correo inválido'
    }
    if (!formData.date) errors.date = 'La fecha es obligatoria'
    if (!formData.time) errors.time = 'La hora es obligatoria'
    if (formData.guests < 1 || formData.guests > 20) errors.guests = 'Entre 1 y 20 personas'

    const selectedDate = new Date(formData.date + 'T' + formData.time)
    if (selectedDate < new Date()) {
      errors.date = 'La reserva debe ser en el futuro'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return

    try {
      await createReservation.mutateAsync(formData)
      alert('¡Reserva creada exitosamente!')
      navigate('/my-reservations')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: Record<string, string[]> } }
      if (axiosError.response?.data) {
        const data = axiosError.response.data
        const fieldErrors: Record<string, string> = {}
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'non_field_errors') {
            setError(value[0])
          } else {
            fieldErrors[key] = value[0]
          }
        })
        setFieldErrors(fieldErrors)
      } else {
        setError('Error al crear la reserva. Intenta nuevamente.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-3xl font-bold text-neutral-900 mb-4">
            <Utensils className="h-10 w-10 text-primary-600" />
            <span>Menú Digital</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Reservar Mesa</h1>
          <p className="mt-2 text-neutral-600">Completa el formulario para reservar tu mesa</p>
        </div>

        <Card>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre completo"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  error={fieldErrors.full_name}
                  required
                  autoComplete="name"
                  autoFocus
                />
                <Input
                  label="Teléfono"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+51 999 999 999"
                  error={fieldErrors.phone}
                  required
                  autoComplete="tel"
                />
              </div>

              <Input
                label="Correo electrónico (opcional)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@ejemplo.com"
                error={fieldErrors.email}
                autoComplete="email"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Fecha"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDate}
                  error={fieldErrors.date}
                  required
                />
                <Input
                  label="Hora"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  min="11:00"
                  max="22:00"
                  error={fieldErrors.time}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Personas</label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={(e) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    {[...Array(20)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'persona' : 'personas'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Observaciones (opcional)</label>
                <textarea
                  name="special_notes"
                  value={formData.special_notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Alergias, ocasión especial, preferencias de mesa..."
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={createReservation.isPending}
              >
                {createReservation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Reservando...
                  </>
                ) : (
                  'Confirmar reserva'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-neutral-200">
            <p className="text-center text-sm text-neutral-600">
              Las reservas están sujetas a disponibilidad. Te confirmaremos por WhatsApp o correo.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}