import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../hooks/useApi';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Input } from '../components/Input';
import { Loader2, Eye, EyeOff, Utensils, UserPlus, CheckCircle } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const register = useRegister();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (name === 'password' && fieldErrors.password_confirm) {
      setFieldErrors((prev) => ({ ...prev, password_confirm: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.username.trim()) errors.username = 'El nombre de usuario es obligatorio';
    else if (formData.username.length < 3) errors.username = 'Mínimo 3 caracteres';
    if (!formData.email.trim()) errors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Correo inválido';
    if (!formData.password) errors.password = 'La contraseña es obligatoria';
    else if (formData.password.length < 8) errors.password = 'Mínimo 8 caracteres';
    if (formData.password !== formData.password_confirm) errors.password_confirm = 'Las contraseñas no coinciden';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    try {
      const response = await register.mutateAsync(formData);
      setUser(response.user);
      setSuccess(true);
      // Redirect to login after a short delay to show success message
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: Record<string, string[]> } };
      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        const fieldErrors: Record<string, string> = {};
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'non_field_errors') {
            setError(value[0]);
          } else {
            fieldErrors[key] = value[0];
          }
        });
        setFieldErrors(fieldErrors);
      } else {
        setError('Error al crear la cuenta. Intenta nuevamente.');
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
          <div className="inline-flex items-center gap-2 p-3 bg-primary-100 rounded-full mb-4">
            <UserPlus className="h-6 w-6 text-primary-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Crear cuenta</h1>
          <p className="mt-2 text-neutral-600">Regístrate para guardar tus pedidos y reservas</p>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader className="text-center mb-8">
            <CardTitle>Únete a Menú Digital</CardTitle>
            <CardDescription>Solo toma un minuto</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {success && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-xl text-success-700 text-sm flex items-center gap-2 animate-slide-up" role="alert">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ¡Cuenta creada exitosamente! Redirigiendo a inicio de sesión...
              </div>
            )}

            {error && (
              <div className="p-4 bg-danger-50 border border-danger-100 rounded-xl text-danger-700 text-sm flex items-center gap-2 animate-slide-up" role="alert">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    error={fieldErrors.first_name}
                    autoComplete="given-name"
                    leftIcon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />
                  <Input
                    label="Apellido"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                    error={fieldErrors.last_name}
                    autoComplete="family-name"
                    leftIcon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />
                </div>

                <Input
                  label="Usuario"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="nombredeusuario"
                  error={fieldErrors.username}
                  required
                  autoComplete="username"
                  autoFocus
                  leftIcon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <Input
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  error={fieldErrors.email}
                  autoComplete="email"
                  leftIcon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <div className="relative">
                  <Input
                    label="Contraseña"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    error={fieldErrors.password}
                    required
                    autoComplete="new-password"
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

                <Input
                  label="Confirmar contraseña"
                  name="password_confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Repite la contraseña"
                  error={fieldErrors.password_confirm}
                  required
                  autoComplete="new-password"
                  leftIcon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={register.isPending}
                >
                  {register.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="border-t border-neutral-100">
            <p className="text-center text-sm text-neutral-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Benefits */}
        <div className="mt-8 space-y-3 animate-fade-in stagger-1">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-100">
            <div className="p-2 bg-success-100 rounded-lg">
              <svg className="h-5 w-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Pedidos rápidos</p>
              <p className="text-sm text-neutral-500">Reordena tus favoritos en un click</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-100">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Historial completo</p>
              <p className="text-sm text-neutral-500">Ve todos tus pedidos y reservas pasados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-100">
            <div className="p-2 bg-warning-100 rounded-lg">
              <svg className="h-5 w-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Favoritos</p>
              <p className="text-sm text-neutral-500">Guarda y accede a tus platos preferidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}