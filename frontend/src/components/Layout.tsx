import { API_BASE_URL } from '../lib/api'
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { Button } from './Button';
import { Badge } from './Badge';
import { cn } from '../lib/utils';
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  ChefHat,
  ClipboardList,
  Utensils,
  Calendar,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const location = useLocation();
  const { user, isAuthenticated, logout: logoutStore } = useAuthStore();
  const { items, getTotalItems, tableNumber } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = getTotalItems();

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore errors
    }
    logoutStore();
  };

  const navItems = [
    { path: '/', label: 'Menú', icon: Utensils },
    { path: '/reserve', label: 'Reservar', icon: Calendar },
  ];

  const authNavItems = [
    { path: '/my-orders', label: 'Mis Pedidos', icon: ClipboardList },
    { path: '/my-reservations', label: 'Mis Reservas', icon: Calendar },
  ];

  const staffNavItems = [
    { path: '/kitchen', label: 'Cocina', icon: ChefHat },
    { path: '/manage-reservations', label: 'Gestionar Reservas', icon: ClipboardList },
  ];

  // Track scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header
        className={cn(
          'sticky top-0 z-40 bg-white border-b transition-all duration-200',
          scrolled
            ? 'border-neutral-200 shadow-sm'
            : 'border-neutral-100'
        )}
      >
        <nav className="container" aria-label="Navegación principal">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <NavLink
                to="/"
                className="flex items-center gap-2 text-xl font-bold text-neutral-900"
                aria-label="Menú Digital - Inicio"
              >
                <Utensils className="h-8 w-8 text-primary-600" aria-hidden="true" />
                <span className="hidden sm:block">Menú Digital</span>
              </NavLink>

              <div className="hidden md:flex md:gap-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      )
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {tableNumber && (
                <Badge variant="warning" className="hidden sm:inline-flex">
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    Mesa {tableNumber}
                  </span>
                </Badge>
              )}

              <NavLink
                to="/cart"
                className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                aria-label={`Carrito de compras${cartCount > 0 ? `, ${cartCount} items` : ', vacío'}`}
              >
                <ShoppingCart className="h-6 w-6" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </NavLink>

              {isAuthenticated ? (
                <div className="hidden md:flex md:items-center md:gap-4">
                  {(user?.is_staff ? staffNavItems : authNavItems).map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                        )
                      }
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </NavLink>
                  ))}

                  <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
                    <span className="text-sm text-neutral-700 font-medium">
                      {user?.first_name || user?.username}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Salir</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex md:items-center md:gap-2">
                  <NavLink
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    Iniciar sesión
                  </NavLink>
                  <NavLink to="/register">
                    <Button size="sm">Registrarse</Button>
                  </NavLink>
                </div>
              )}

              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-neutral-100 animate-slide-down">
            <div className="flex flex-col gap-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    )
                  }
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="pt-2 border-t border-neutral-100" />
                  {(user?.is_staff ? staffNavItems : authNavItems).map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                        )
                      }
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      {label}
                    </NavLink>
                  ))}

                  <div className="pt-4 border-t border-neutral-100 flex items-center gap-3 px-3">
                    <User className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    <span className="text-base font-medium text-neutral-700 flex-1">
                      {user?.first_name || user?.username}
                    </span>
                    <Button variant="outline" size="sm" className="w-auto" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-1" aria-hidden="true" />
                      Salir
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3 px-3">
                    <NavLink
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center px-4 py-2.5 text-base font-medium text-neutral-700 hover:text-neutral-900"
                    >
                      Iniciar sesión
                    </NavLink>
                    <NavLink to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Registrarse</Button>
                    </NavLink>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-neutral-200 py-8">
        <div className="container text-center text-sm text-neutral-500">
          <p>Menú Digital - Sistema de pedidos y reservas para restaurantes</p>
        </div>
      </footer>
    </div>
  );
}

// Need to import useEffect
import { useEffect } from 'react';
