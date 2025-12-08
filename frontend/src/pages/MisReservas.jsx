import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reservasService } from '../services/services';

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useContext(AuthContext);

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setCargando(true);
      const data = await reservasService.getMisReservas();
      setReservas(data.reservas);
    } catch (err) {
      setError('Error al cargar reservas');
    } finally {
      setCargando(false);
    }
  };

  const cancelarReserva = async (id) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) {
      return;
    }

    try {
      await reservasService.cancelar(id);
      alert('Reserva cancelada exitosamente');
      cargarReservas();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al cancelar reserva');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      completada: 'bg-blue-100 text-blue-800'
    };
    
    const iconos = {
      pendiente: 'fa-clock',
      confirmada: 'fa-check-circle',
      cancelada: 'fa-times-circle',
      completada: 'fa-flag-checkered'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[estado]}`}>
        <i className={`fas ${iconos[estado]} mr-1`}></i>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            <i className="fas fa-list text-primary-600 mr-3"></i>
            Mis Reservas
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona todas tus reservas en un solo lugar
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {reservas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <i className="fas fa-calendar-times text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No tienes reservas
            </h2>
            <p className="text-gray-500 mb-6">
              ¡Haz tu primera reserva y disfruta de la playa!
            </p>
            <Link
              to="/reservar"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Hacer una Reserva
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {reserva.propiedad_nombre}
                      </h3>
                      <p className="text-gray-600">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {reserva.direccion}
                      </p>
                    </div>
                    {getEstadoBadge(reserva.estado)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        Entrada
                      </div>
                      <div className="font-semibold">
                        {new Date(reserva.fecha_entrada).toLocaleDateString('es-GT', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        Salida
                      </div>
                      <div className="font-semibold">
                        {new Date(reserva.fecha_salida).toLocaleDateString('es-GT', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        <i className="fas fa-users mr-2"></i>
                        Personas
                      </div>
                      <div className="font-semibold">{reserva.num_personas}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        <i className="fas fa-money-bill-wave mr-2"></i>
                        Total
                      </div>
                      <div className="font-semibold text-primary-600">
                        Q{reserva.precio_total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {reserva.comentarios && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="text-sm text-gray-600 mb-1">
                        <i className="fas fa-comment mr-2"></i>
                        Comentarios
                      </div>
                      <p className="text-gray-700">{reserva.comentarios}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Solicitada el {new Date(reserva.fecha_solicitud).toLocaleDateString()}
                    </div>
                    {reserva.estado === 'pendiente' && (
                      <button
                        onClick={() => cancelarReserva(reserva.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Cancelar Reserva
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisReservas;
