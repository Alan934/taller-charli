import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ email, password, fullName, phone });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4 font-sans text-[#111518]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
        
        {/* Header */}
        <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Crear cuenta</h1>
            <p className="text-gray-500 text-sm mt-2">Únete para gestionar tus reparaciones</p>
        </div>

        {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
            </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Nombre completo</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">badge</span>
                </div>
                <input
                    type="text"
                    required
                    className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-gray-50/50"
                    placeholder="Tu nombre y apellido"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Correo electrónico</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                </div>
                <input
                    type="email"
                    required
                    className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-gray-50/50"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Número de celular</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">phone_iphone</span>
                </div>
                <input
                    type="tel"
                    required
                    inputMode="tel"
                    pattern="[0-9]{7,15}"
                    className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-gray-50/50"
                    placeholder="261..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Contraseña</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">key</span>
                </div>
                <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-10 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-gray-50/50"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white py-3 font-semibold shadow-md shadow-blue-500/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? (
                <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Creando cuenta...</span>
                </>
            ) : (
                'Registrarme'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/auth/login" className="font-bold text-primary hover:underline hover:text-blue-700 transition-colors">
                    Inicia sesión
                </Link>
            </p>
            <Link to="/" className="inline-block mt-4 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors">
                ← Volver al inicio
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
