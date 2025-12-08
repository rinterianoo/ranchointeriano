import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-700 hover:text-primary-500';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <i className="fas fa-umbrella-beach text-primary-600 text-2xl"></i>
              <span className="text-xl font-bold text-gray-800">Monterrico</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/')}`}>
                <i className="fas fa-home mr-2"></i>
                Inicio
              </Link>
              <Link to="/reservar" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/reservar')}`}>
                <i className="fas fa-calendar-check mr-2"></i>
                Reservar
              </Link>
              {usuario?.rol === 'admin' && (
                <Link to="/admin" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/admin')}`}>
                  <i className="fas fa-user-shield mr-2"></i>
                  Panel Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {usuario?.rol === 'admin' ? (
              <>
                <span className="text-sm text-gray-700">
                  <i className="fas fa-user mr-2"></i>
                  {usuario.nombre}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-primary-600 px-4 py-2 text-sm font-medium"
              >
                <i className="fas fa-user-shield mr-2"></i>
                Administrador
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
