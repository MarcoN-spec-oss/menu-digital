import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle } from 'lucide-react';
import { formatPrice } from '../lib/utils';
export function CartPage() {
    const { items, updateQuantity, removeItem, clearCart, getSubtotal, tableNumber } = useCartStore();
    if (items.length === 0) {
        return (<div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
        <Card variant="elevated" className="w-full max-w-md text-center py-12 animate-fade-in">
          <CardContent className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-neutral-900">Tu carrito esta vacio</h2>
              <p className="text-neutral-500">Agrega algunos platillos del menu para comenzar tu pedido</p>
            </div>
            <Link to="/menu">
              <Button className="w-full" size="lg">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                </svg>
                Ver el menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>);
        div >
        ;
        ;
        const subtotal = getSubtotal();
        return (<div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900">Tu Carrito</h1>
            <p className="text-neutral-600">{items.length} {items.length === 1 ? 'platillo' : 'platillos'}</p>
          </div>
          {tableNumber && (<Badge variant="primary" className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Mesa {tableNumber}
            </Badge>)}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card variant="outlined" padding="none" className="overflow-hidden">
              <div className="divide-y divide-neutral-100">
                {items.map((item, index) => (<div key={item.dish.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                      {item.dish.image_url ? (<img src={item.dish.image_url} alt={item.dish.name} className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate">{item.dish.name}</h3>
                      <p className="text-sm text-neutral-500">{formatPrice(item.dish.price)} c/u</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                        <button onClick={() => updateQuantity(item.dish.id, item.quantity - 1)} className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors" aria-label="Disminuir cantidad">
                          <Minus className="h-5 w-5"/>
                        </button>
                        <span className="px-4 py-2 text-center font-medium text-neutral-900 w-12 border-x border-neutral-200">
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.dish.id, item.quantity + 1)} className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors" aria-label="Aumentar cantidad">
                          <Plus className="h-5 w-5"/>
                        </button>
                      </div>

                      <div className="text-right w-24 sm:w-32">
                        <p className="font-semibold text-neutral-900">
                          {formatPrice(parseFloat(item.dish.price) * item.quantity)}
                        </p>
                      </div>

                      <button onClick={() => removeItem(item.dish.id)} className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors" aria-label={`Eliminar ${item.dish.name}`}>
                        <Trash2 className="h-5 w-5"/>
                      </button>
                    </div>
                  </div>))}
              </div>
            </Card>

            {items.length > 1 && (<Button variant="outline" onClick={clearCart} className="w-full sm:w-auto mt-4">
                <Trash2 className="h-4 w-4 mr-2"/>
                Vaciar carrito
              </Button>)}
          </div>

          <div className="lg:col-span-1">
            <Card variant="elevated" className="sticky top-24 animate-fade-in stagger-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                  </div>
                  Resumen del pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (<div key={item.dish.id} className="flex justify-between py-2 border-b border-neutral-100 last:border-0">
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-neutral-900 truncate">{item.dish.name}</p>
                        <p className="text-sm text-neutral-500">
                          {item.quantity} x {formatPrice(item.dish.price)}
                        </p>
                      </div>
                      <span className="font-medium text-neutral-900 whitespace-nowrap">
                        {formatPrice(parseFloat(item.dish.price) * item.quantity)}
                      </span>
                    </div>))}
                  <div className="pt-2 border-t border-neutral-200 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Subtotal</span>
                      <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>Envio</span>
                      <span className="font-medium text-success-600">Gratis</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                      <span>Total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-neutral-100 space-y-3">
                <Link to="/menu">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2"/>
                    Seguir pidiendo
                  </Button>
                </Link>
                <Link to="/checkout">
                  <Button className="w-full" size="lg">
                    Confirmar pedido
                    <span className="ml-2 font-medium">{formatPrice(subtotal)}</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center animate-fade-in stagger-2">
              <div className="p-3 bg-white rounded-xl border border-neutral-100">
                <div className="p-2 bg-success-100 rounded-lg mx-auto mb-2 w-10 h-10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success-600"/>
                </div>
                <p className="text-xs font-medium text-neutral-700">Pago seguro</p>
                <p className="text-xs text-neutral-500">Protegido</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-neutral-100">
                <div className="p-2 bg-primary-100 rounded-lg mx-auto mb-2 w-10 h-10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <p className="text-xs font-medium text-neutral-700">Datos seguros</p>
                <p className="text-xs text-neutral-500">Encriptados</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-neutral-100">
                <div className="p-2 bg-warning-100 rounded-lg mx-auto mb-2 w-10 h-10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0112 18c2.026 0 3.881-.584 5.657-1.657z"/>
                  </svg>
                </div>
                <p className="text-xs font-medium text-neutral-700">Soporte 24/7</p>
                <p className="text-xs text-neutral-500">Siempre contigo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
    }
}
