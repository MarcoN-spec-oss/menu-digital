import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateOrder } from '../hooks/useApi';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { formatPrice } from '../lib/utils';
import { Loader2, Truck, Shield, Clock, MapPin } from 'lucide-react';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart, tableNumber } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const createOrder = useCreateOrder();

  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const subtotal = getSubtotal();

  const emptyCart = (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <Card variant="elevated" className="w-full max-w-md text-center py-12 animate-fade-in">
        <CardContent className="space-y-6">
          <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-neutral-900">Carrito vacio</h2>
            <p className="text-neutral-500">No hay platillos en tu carrito</p>
          </div>
          <Button onClick={() => navigate('/menu')} className="w-full" size="lg">
            Ver el menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!isAuthenticated && !customerName.trim()) {
      errors.customerName = 'El nombre es obligatorio para invitados';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createOrder.mutateAsync({
        customer_name: isAuthenticated ? '' : customerName,
        table_number: tableNumber || undefined,
        notes,
        items: items.map((item) => ({
          dish_id: item.dish.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      navigate('/cart', { state: { orderConfirmed: true } });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      if (axiosError.response?.data?.detail) {
        setFormErrors({ submit: axiosError.response.data.detail });
      } else {
        setFormErrors({ submit: 'Error al procesar el pedido. Intenta nuevamente.' });
      }
    }
  };

  return items.length === 0 ? emptyCart : (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container max-w-3xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-neutral-900">Confirmar Pedido</h1>
          <p className="text-neutral-600">Revisa tu pedido y completa la informacion</p>
        </div>

        {tableNumber && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3 text-primary-800">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium">Mesa activa</p>
                <p className="text-sm">Mesa {tableNumber} - Tu pedido se asociara a esta mesa</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in stagger-1">
          {!isAuthenticated && (
            <Card variant="outlined" padding="lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Informacion del comensal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nombre completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={formErrors.customerName}
                  placeholder="Tu nombre"
                  required
                  autoComplete="name"
                  autoFocus
                  leftIcon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
              </CardContent>
            </Card>
          )}

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                Observaciones (opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
                placeholder="Alergias, preferencias de coccion, instrucciones especiales..."
              />
            </CardContent>
          </Card>

          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                Resumen del pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.dish.id} className="flex justify-between py-3 border-b border-neutral-100 last:border-0">
                    <div>
                      <p className="font-medium text-neutral-900">{item.dish.name}</p>
                      <p className="text-sm text-neutral-500">
                        {item.quantity} x {formatPrice(item.dish.price)}
                      </p>
                    </div>
                    <span className="font-medium text-neutral-900 whitespace-nowrap">
                      {formatPrice(parseFloat(item.dish.price) * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-lg font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-neutral-100 space-y-3">
              {formErrors.submit && (
                <div className="p-3 bg-danger-50 border border-danger-100 rounded-xl text-danger-700 text-sm flex items-center gap-2" role="alert">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
                  </svg>
                  {formErrors.submit}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Enviando a cocina...
                  </>
                ) : (
                  <>
                    Enviar pedido a cocina
                    <span className="ml-2 font-medium">{formatPrice(subtotal)}</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in stagger-2">
          <div className="p-4 bg-white rounded-xl border border-neutral-100 text-center">
            <div className="p-2 bg-primary-100 rounded-lg mx-auto mb-2 w-10 h-10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-sm font-medium text-neutral-700">Preparacion rapida</p>
            <p className="text-sm text-neutral-500">15-25 min promedio</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-neutral-100 text-center">
            <div className="p-2 bg-success-100 rounded-lg mx-auto mb-2 w-10 h-10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-success-600" />
            </div>
            <p className="text-sm font-medium text-neutral-700">Pago seguro</p>
            <p className="text-sm text-neutral-500">Multiples opciones</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-neutral-100 text-center">
            <div className="p-2 bg-warning-100 rounded-lg mx-auto mb-2 w-10 h-10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning-600" />
            </div>
            <p className="text-sm font-medium text-neutral-700">Soporte</p>
            <p className="text-sm text-neutral-500">Disponible 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}