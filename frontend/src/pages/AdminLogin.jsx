import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Contraseña simple para admin (en producción usar backend)
      if (password === 'rancho2024') {
        localStorage.setItem('adminAuth', 'true');
        navigate('/admin');
      } else {
        setError('Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 sm:py-12 px-4">
      <div className="w-full max-w-xs">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <i className="fas fa-lock text-primary-600 text-4xl sm:text-5xl mb-4"></i>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Admin
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Ingresa contraseña
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm sm:text-base"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base mt-6"
          >
            {cargando ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Verificando...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Ingresar
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Acceso exclusivo para administración
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
