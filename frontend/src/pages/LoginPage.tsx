import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLogin } from '../hooks/useApi';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Input } from '../components/Input';
import { Loader2, Eye, EyeOff, Utensils, CheckCircle } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const login = useLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login.mutateAsync({ username, password });
      setUser(response.user);
      setSuccess(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      if (axiosError.response?.data?.detail) {
        setError(axiosError.response.data.detail);
      } else {
        setError('Credenciales inválidas. Verifica tu usuario y contraseña.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-10 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold text-neutral-900 mb-6">
            <Utensils className="h-10 w-10 text-primary-600" aria-hidden="true" />
            <span>Menú Digital</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Iniciar sesión</h1>
          <p className="mt-2 text-neutral-600">Accede a tu cuenta para ver tus pedidos y reservas</p>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader className="text-center mb-8">
            <CardTitle>Bienvenido de nuevo</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {success && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-xl text-success-700 text-sm flex items-center gap-2 animate-slide-up" role="alert">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ¡Bienvenido! Redirigiendo...
              </div>
            )}

            {error && (
              <div className="p-4 bg-danger-50 border border-danger-100 rounded-xl text-danger-700 text-sm flex items-center gap-2 animate-slide-up" role="alert">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Usuario"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre de usuario"
                required
                autoComplete="username"
                autoFocus
                leftIcon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  autoComplete="current-password"
                  leftIcon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={login.isPending}
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-neutral-100 flex flex-col gap-5">
            <p className="text-center text-sm text-neutral-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Regístrate
              </Link>
            </p>
            <div className="text-center text-sm text-neutral-500 p-3 bg-neutral-50 rounded-xl">
              <p className="font-medium text-neutral-700 mb-1">Credenciales de prueba:</p>
              <p><code className="bg-neutral-100 px-1.5 py-0.5 rounded text-sm font-mono">admin</code> / <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-sm font-mono">admin123</code></p>
            </div>
          </CardFooter>
        </Card>

        {/* Features hint */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in stagger-1">
          <div className="text-center p-4 bg-white rounded-xl border border-neutral-100">
            <div className="mx-auto w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-neutral-700">Historial</p>
            <p className="text-xs text-neutral-500">Tus pedidos y reservas</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-neutral-100">
            <div className="mx-auto w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-xs font-medium text-neutral-700">Seguimiento</p>
            <p className="text-xs text-neutral-500">Estado en tiempo real</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-neutral-100">
            <div className="mx-auto w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-neutral-700">Favoritos</p>
            <p className="text-xs text-neutral-500">Guarda tus platos</p>
          </div>
        </div>
      </div>
    </div>
  );
}