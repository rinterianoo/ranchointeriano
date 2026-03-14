import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();
  const isAdmin = usuario?.rol === 'admin';
  const isAdminRoute = location.pathname === '/admin';

  // Estado para controlar la posición del navbar con scroll
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para animar el navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
    };

    // Sincronizar estado inicial al cargar la página
    handleScroll();

    // Solo agregar el listener si no es ruta de admin
    if (!isAdminRoute) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAdminRoute]);

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-700 hover:text-primary-500';
  };

  return (
    <nav
      className={`${
        isAdminRoute
          ? 'hidden' // Ocultar navbar completamente en rutas de admin
          : `fixed top-0 left-4 right-4 backdrop-blur-md border border-white/30 hover:shadow-[0_20px_40px_rgb(0,0,0,0.15)] transform transition-all duration-500 ${
              scrolled
                ? 'bg-white/95 shadow-[0_10px_30px_rgb(0,0,0,0.14)]'
                : 'bg-white/88 shadow-[0_8px_24px_rgb(0,0,0,0.1)]'
            }`
      } rounded-2xl z-50 hover:-translate-y-1 hover:scale-[1.01]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <i className="fas fa-umbrella-beach text-primary-600 text-2xl"></i>
              <span className="text-lg sm:text-xl font-bold text-gray-800">Rancho Interiano</span>
            </Link>
            {!isAdmin && (
              <div className="hidden md:flex ml-10 space-x-8">
                <Link to="/" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/')}`}>
                  <i className="fas fa-home mr-2"></i>
                  Inicio
                </Link>
                <Link to="/reservar#formulario-reserva" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/reservar')}`}>
                  <i className="fas fa-calendar-check mr-2"></i>
                  Reservar
                </Link>
              </div>
            )}
            {isAdmin && (
              <div className="hidden md:flex ml-10 space-x-8">
                <Link to="/admin" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/admin')}`} title="Panel de Control">
                  <i className="fas fa-cog"></i>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!isAdmin && (
              <Link 
                to="/reservar#formulario-reserva" 
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <i className="fas fa-calendar-check mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Reservar</span>
                <span className="sm:hidden">Reserva</span>
              </Link>
            )}
            {isAdmin && (
              <>
                <span className="text-sm text-gray-700" title={usuario.nombre}>
                  <i className="fas fa-user"></i>
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  title="Cerrar Sesión"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
