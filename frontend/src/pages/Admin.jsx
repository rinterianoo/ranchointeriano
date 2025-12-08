import { useState, useEffect } from 'react';
import { reservasService } from '../services/services';

const Admin = () => {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setCargando(true);
      const data = await reservasService.getTodasReservas();
      setReservas(data.reservas);
    } catch (err) {
      setError('Error al cargar reservas');
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await reservasService.actualizarEstado(id, nuevoEstado);
      alert('Estado actualizado exitosamente');
      cargarReservas();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al actualizar estado');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      completada: 'bg-blue-100 text-blue-800'
    };

    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const reservasFiltradas = filtro === 'todas' 
    ? reservas 
    : reservas.filter(r => r.estado === filtro);

  const estadisticas = {
    total: reservas.length,
    pendientes: reservas.filter(r => r.estado === 'pendiente').length,
    confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
    canceladas: reservas.filter(r => r.estado === 'cancelada').length
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
            <i className="fas fa-user-shield text-primary-600 mr-3"></i>
            Panel de Administración
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona todas las reservas del sistema
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reservas</p>
                <p className="text-3xl font-bold text-gray-800">{estadisticas.total}</p>
              </div>
              <i className="fas fa-list text-4xl text-gray-400"></i>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
              </div>
              <i className="fas fa-clock text-4xl text-yellow-400"></i>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmadas</p>
                <p className="text-3xl font-bold text-green-600">{estadisticas.confirmadas}</p>
              </div>
              <i className="fas fa-check-circle text-4xl text-green-400"></i>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Canceladas</p>
                <p className="text-3xl font-bold text-red-600">{estadisticas.canceladas}</p>
              </div>
              <i className="fas fa-times-circle text-4xl text-red-400"></i>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'todas' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltro('pendiente')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'pendiente' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltro('confirmada')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'confirmada' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Confirmadas
            </button>
            <button
              onClick={() => setFiltro('cancelada')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'cancelada' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Canceladas
            </button>
          </div>
        </div>

        {/* Lista de reservas */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservasFiltradas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reserva.usuario_nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        <i className="fas fa-envelope mr-1"></i>
                        {reserva.usuario_email}
                      </div>
                      {reserva.usuario_telefono && (
                        <div className="text-sm text-gray-500">
                          <i className="fas fa-phone mr-1"></i>
                          {reserva.usuario_telefono}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reserva.propiedad_nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(reserva.fecha_entrada).toLocaleDateString()} -
                      </div>
                      <div className="text-sm text-gray-900">
                        {new Date(reserva.fecha_salida).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reserva.num_personas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Q{reserva.precio_total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(reserva.estado)}`}>
                        {reserva.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={reserva.estado}
                        onChange={(e) => cambiarEstado(reserva.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="completada">Completada</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reservasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">No hay reservas para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
