import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reservasService, preciosService } from '../services/services';

const Admin = () => {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [verHistorial, setVerHistorial] = useState(false);
  const [vista, setVista] = useState('reservaciones'); // 'reservaciones', 'calendario'
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [preciosPorNoche, setPreciosPorNoche] = useState({});
  const [nochesBloquedas, setNochesBloquedas] = useState({});
  const [comentariosNoches, setComentariosNoches] = useState({});
  const [precioBase, setPrecioBase] = useState(200); // Precio base por noche
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [errorGuardado, setErrorGuardado] = useState('');
  const [guardandoPrecios, setGuardandoPrecios] = useState(false);
  const [preciosCalendario, setPreciosCalendario] = useState({});
  const [cargandoCalendario, setCargandoCalendario] = useState(false);
  
  // Estados para modal de reservas
  const [modalReserva, setModalReserva] = useState({ mostrar: false, tipo: '', mensaje: '' });

  // Contexto de autenticación
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    cargarReservas();
  }, []);

  useEffect(() => {
    if (vista === 'calendario') {
      cargarPreciosCalendario();
    }
  }, [vista, fechaCalendario]);

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

  const cargarPreciosCalendario = async () => {
    try {
      setCargandoCalendario(true);
      const año = fechaCalendario.getFullYear();
      const mes = fechaCalendario.getMonth();
      
      // Obtener primer y último día del mes
      const primerDia = new Date(año, mes, 1).toISOString().split('T')[0];
      const ultimoDia = new Date(año, mes + 1, 0).toISOString().split('T')[0];
      

      // Cargar precios dinámicos para el mes
      const data = await preciosService.obtenerPrecios(1, primerDia, ultimoDia);
      
      // Crear mapa de precios de la BD
      const precios = {};
      if (data.precios && Array.isArray(data.precios)) {
        data.precios.forEach(p => {
          // Normalizar fecha al formato YYYY-MM-DD
          // La fecha puede venir como "2026-03-25" o "2026-03-25T00:00:00Z"
          const fechaNormalizada = p.fecha.split('T')[0];
          precios[fechaNormalizada] = {
            precio: p.precio,
            estado: p.estado,
            comentario: p.comentario
          };
        });
      }
      
      setPreciosCalendario(precios);
      setPrecioBase(data.precioBase);
    } catch (err) {
      // Error silencioso
    } finally {
      setCargandoCalendario(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      setModalReserva({ mostrar: false, tipo: '', mensaje: '' });
      
      await reservasService.actualizarEstado(id, nuevoEstado);
      
      // Mostrar mensaje de éxito según el estado
      let mensaje = '';
      if (nuevoEstado === 'confirmada') {
        mensaje = 'Reserva confirmada exitosamente';
      } else if (nuevoEstado === 'cancelada') {
        mensaje = 'Reserva cancelada exitosamente';
      } else if (nuevoEstado === 'completada') {
        mensaje = 'Reserva marcada como completada';
      }
      
      setModalReserva({ mostrar: true, tipo: 'exito', mensaje });
      
      // Cerrar modal automáticamente después de 3 segundos
      setTimeout(() => {
        setModalReserva({ mostrar: false, tipo: '', mensaje: '' });
      }, 3000);
      
      cargarReservas();
    } catch (err) {
      const errorMsg = err.response?.data?.mensaje || 'Error al actualizar estado de la reserva';
      setModalReserva({ mostrar: true, tipo: 'error', mensaje: errorMsg });
      
      // Cerrar modal automáticamente después de 4 segundos
      setTimeout(() => {
        setModalReserva({ mostrar: false, tipo: '', mensaje: '' });
      }, 4000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Guardar cambios de precios
  const guardarCambiosPrecios = async () => {
    try {
      setGuardandoPrecios(true);
      setErrorGuardado('');
      setMensajeGuardado('');

      // Preparar array de cambios
      const cambios = [];

      // Agregar cambios de precios
      Object.keys(preciosPorNoche).forEach(fecha => {
        cambios.push({
          fecha,
          precio: preciosPorNoche[fecha],
          estado: nochesBloquedas[fecha] ? 'bloqueada' : 'disponible',
          comentario: comentariosNoches[fecha] || ''
        });
      });

      // Agregar cambios de estado (bloqueos)
      Object.keys(nochesBloquedas).forEach(fecha => {
        if (!preciosPorNoche[fecha]) {
          const precio = preciosCalendario[fecha]?.precio || precioBase;
          cambios.push({
            fecha,
            precio,
            estado: nochesBloquedas[fecha] ? 'bloqueada' : 'disponible',
            comentario: comentariosNoches[fecha] || ''
          });
        }
      });

      if (cambios.length === 0) {
        setMensajeGuardado('No hay cambios para guardar');
        return;
      }

      // Guardar cambios (usando propiedad ID 1 - por ahora, se puede hacer dinámico después)
      await preciosService.actualizarPrecios(1, cambios);

      // Limpiar estados locales ANTES de recargar
      setPreciosPorNoche({});
      setNochesBloquedas({});
      setComentariosNoches({});
      
      // Esperar un poco para asegurar que la BD está actualizada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recargar precios del calendario
      await cargarPreciosCalendario();

      setMensajeGuardado(`${cambios.length} cambios guardados exitosamente`);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensajeGuardado(''), 3000);
    } catch (err) {
      setErrorGuardado(err.response?.data?.mensaje || 'Error al guardar precios');
    } finally {
      setGuardandoPrecios(false);
    }
  };

  // Filtrar reservas por tipo
  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente');
  const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada' || r.estado === 'completada');
  const todasReservasPendientes = reservas.filter(r => r.estado === 'pendiente');
  const reservasHistorial = reservas.filter(r => r.estado !== 'pendiente');
  const reservasAMostrar = verHistorial ? reservasHistorial : todasReservasPendientes;

  // Paginación
  const totalPaginas = Math.ceil(reservasAMostrar.length / itemsPorPagina);
  const indiceInicial = (paginaActual - 1) * itemsPorPagina;
  const indiceFinal = indiceInicial + itemsPorPagina;
  const reservasEnPagina = reservasAMostrar.slice(indiceInicial, indiceFinal);

  // Resetear página cuando cambia entre Pendientes/Historial
  useEffect(() => {
    setPaginaActual(1);
  }, [verHistorial]);

  // Obtener próximas reservaciones (próximos 30 días)
  const reservasProximas = reservasConfirmadas
    .filter(r => new Date(r.fecha_entrada) > new Date() && new Date(r.fecha_entrada) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.fecha_entrada) - new Date(b.fecha_entrada));

  // Cambiar precio de una noche
  const cambiarPrecioNoche = (fecha, precio) => {
    setPreciosPorNoche({
      ...preciosPorNoche,
      [fecha]: precio
    });
  };

  // Toggle bloquear noche
  const toggleBloquearNoche = (fecha) => {
    setNochesBloquedas({
      ...nochesBloquedas,
      [fecha]: !nochesBloquedas[fecha]
    });
  };

  // Agregar comentario a noche
  const agregarComentarioNoche = (fecha, comentario) => {
    setComentariosNoches({
      ...comentariosNoches,
      [fecha]: comentario
    });
  };

  // Renderizar calendario
  const renderizarCalendario = () => {
    const año = fechaCalendario.getFullYear();
    const mes = fechaCalendario.getMonth();
    
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasMes = ultimoDia.getDate();
    const diaInicio = primerDia.getDay();

    const dias = [];
    for (let i = 0; i < diaInicio; i++) {
      dias.push(null);
    }
    for (let i = 1; i <= diasMes; i++) {
      dias.push(i);
    }

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Si hay una fecha seleccionada, obtener sus datos
    let datosFechaSeleccionada = null;
    let precioFechaSeleccionada = precioBase;
    let bloqueadaFechaSeleccionada = false;
    
    if (fechaSeleccionada) {
      const datosGuardados = preciosCalendario[fechaSeleccionada];
      const precioLocal = preciosPorNoche[fechaSeleccionada];
      
      if (precioLocal !== undefined) {
        precioFechaSeleccionada = precioLocal;
        bloqueadaFechaSeleccionada = nochesBloquedas[fechaSeleccionada] !== undefined ? nochesBloquedas[fechaSeleccionada] : (datosGuardados?.estado === 'bloqueada');
      } else if (datosGuardados) {
        precioFechaSeleccionada = datosGuardados.precio;
        bloqueadaFechaSeleccionada = datosGuardados.estado === 'bloqueada';
      }
      
      datosFechaSeleccionada = { precioFechaSeleccionada, bloqueadaFechaSeleccionada };
    }

    return (
      <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            {meses[mes]}
          </h2>
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setFechaCalendario(new Date(año, mes - 1, 1))}
              className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors text-xs sm:text-sm"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              onClick={() => setFechaCalendario(new Date())}
              className="px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-xs sm:text-sm"
            >
              Hoy
            </button>
            <button
              onClick={() => setFechaCalendario(new Date(año, mes + 1, 1))}
              className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors text-xs sm:text-sm"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 relative">
          {/* Calendario */}
          <div className="flex-1">
            {/* Leyenda */}
            <div className="flex justify-center mb-4 sm:mb-6 text-xs">
              <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded flex-shrink-0"></div>
                <span>Confirmada</span>
              </div>
            </div>

            {/* Grid de días de la semana */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-3 text-xs sm:text-sm font-bold text-gray-600">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                <div key={d} className="text-center py-1 sm:py-2">
                  <span className="inline sm:hidden">{d}</span>
                  <span className="hidden sm:inline">{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].find((_, i) => ['D', 'L', 'M', 'X', 'J', 'V', 'S'][i] === d)}</span>
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {dias.map((dia, index) => {
                if (!dia) return <div key={`empty-${index}`}></div>;

                const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                
                // Obtener datos
                const datosGuardados = preciosCalendario[fecha];
                const precioLocal = preciosPorNoche[fecha];
                const bloqueadoLocal = nochesBloquedas[fecha];
                
                let precioNoche;
                let estaBloqueda;
                
                if (precioLocal !== undefined) {
                  precioNoche = precioLocal;
                  estaBloqueda = bloqueadoLocal !== undefined ? bloqueadoLocal : (datosGuardados?.estado === 'bloqueada');
                } else if (datosGuardados) {
                  precioNoche = datosGuardados.precio;
                  estaBloqueda = datosGuardados.estado === 'bloqueada';
                } else {
                  precioNoche = precioBase;
                  estaBloqueda = false;
                }
                
                const tieneReservaConfirmada = reservasConfirmadas.some(r => {
                  const entrada = new Date(r.fecha_entrada);
                  const salida = new Date(r.fecha_salida);
                  const diaFecha = new Date(fecha);
                  return diaFecha >= entrada && diaFecha < salida;
                });

                const tieneReservaPendiente = todasReservasPendientes.some(r => {
                  const entrada = new Date(r.fecha_entrada);
                  const salida = new Date(r.fecha_salida);
                  const diaFecha = new Date(fecha);
                  return diaFecha >= entrada && diaFecha < salida;
                });

                const tieneReserva = tieneReservaConfirmada || tieneReservaPendiente;

                const isSelected = fechaSeleccionada === fecha;
                const hasChanges = precioLocal !== undefined;

                return (
                  <button
                    key={dia}
                    onClick={() => tieneReserva ? null : setFechaSeleccionada(fecha)}
                    disabled={tieneReserva}
                    className={`aspect-square p-1 sm:p-2 lg:p-3 rounded border-2 transition-all text-center flex flex-col items-center justify-center gap-0.5 sm:gap-1 font-semibold ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50 shadow-md'
                        : estaBloqueda
                        ? 'border-red-300 bg-red-50 hover:border-red-500'
                        : tieneReservaConfirmada
                        ? 'border-orange-400 bg-orange-100 cursor-not-allowed opacity-90'
                        : tieneReservaPendiente
                        ? 'border-yellow-400 bg-yellow-100 cursor-not-allowed opacity-90'
                        : 'border-green-300 bg-green-50 hover:border-green-500'
                    }`}
                  >
                    <div className="text-xs sm:text-sm lg:text-base text-gray-800">{dia}</div>
                    <div className="text-xs lg:text-sm text-gray-700 leading-none font-semibold">
                      Q{Number(precioNoche).toLocaleString('es-GT')}
                    </div>
                    {estaBloqueda && !tieneReserva && (
                      <div className="text-red-600 text-xs leading-none font-bold">BLOQUEADA</div>
                    )}
                    {hasChanges && !tieneReserva && !estaBloqueda && <div className="text-yellow-500 text-xs leading-none">●</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel Modal - Centrado */}
          {fechaSeleccionada && datosFechaSeleccionada && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={() => setFechaSeleccionada(null)}
              />
              
              {/* Panel Centrado */}
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 text-white rounded-2xl p-4 sm:p-5 w-full sm:w-96 max-h-screen overflow-y-auto">
                {/* Header con botón cerrar */}
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-700">
                  <h3 className="text-lg font-bold">Ajustar fecha</h3>
                  <button
                    onClick={() => setFechaSeleccionada(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                {/* Fecha seleccionada */}
                <div className="mb-6 text-center">
                  <p className="text-xs text-gray-400 mb-1 font-semibold uppercase">Fecha seleccionada</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {new Date(fechaSeleccionada).toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </p>
                </div>

                {/* Sección de Precio */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                  <label className="block text-xs text-gray-400 mb-3 font-semibold uppercase">Precio por noche</label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="number"
                      value={precioFechaSeleccionada}
                      onChange={(e) => cambiarPrecioNoche(fechaSeleccionada, parseInt(e.target.value) || precioBase)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 sm:py-2 text-white font-bold text-base sm:text-sm focus:outline-none focus:border-primary-600"
                      placeholder="Precio"
                    />
                    <div className="bg-primary-600 rounded-lg px-3 py-3 sm:py-2 text-white font-bold text-lg sm:text-base text-center">
                      Q{Number(precioFechaSeleccionada).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Sección de Bloquear */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                  <label className="block text-xs text-gray-400 mb-3 font-semibold uppercase">Estado</label>
                  <button
                    onClick={() => toggleBloquearNoche(fechaSeleccionada)}
                    className={`w-full py-3 sm:py-2 px-3 rounded-lg font-bold transition-colors text-sm ${
                      bloqueadaFechaSeleccionada
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <i className={`fas fa-${bloqueadaFechaSeleccionada ? 'lock-open' : 'lock'} mr-2`}></i>
                    {bloqueadaFechaSeleccionada ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setFechaSeleccionada(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 sm:py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <i className="fas fa-times"></i>
                    Cancelar
                  </button>
                  <button
                    onClick={() => setFechaSeleccionada(null)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 sm:py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <i className="fas fa-check"></i>
                    Listo
                  </button>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
          <p className="text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 w-full z-30">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              <i className="fas fa-chart-line text-primary-600 mr-2"></i>
              Panel de Control
            </h1>

            {/* Información del usuario y botón logout */}
            <div className="flex items-center space-x-3">
              <span className="hidden sm:block text-sm text-gray-600" title={usuario?.nombre}>
                <i className="fas fa-user-shield mr-2"></i>
                {usuario?.nombre}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                title="Cerrar Sesión"
              >
                <i className="fas fa-sign-out-alt mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs - Fully Responsive */}
          <div className="bg-gray-50 border-t border-gray-200 px-3 sm:px-6 lg:px-8 overflow-x-auto">
            <div className="max-w-6xl mx-auto flex gap-1 pb-0">
              <button
                onClick={() => {setVista('reservaciones'); setVerHistorial(false)}}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 font-semibold transition-all whitespace-nowrap text-xs sm:text-sm md:text-base border-b-4 ${
                  vista === 'reservaciones'
                    ? 'border-primary-600 text-primary-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-800 bg-gray-50'
                }`}
              >
                <i className="fas fa-calendar-check mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Reservaciones</span>
                <span className="sm:hidden">Reservas</span>
              </button>
              <button
                onClick={() => setVista('calendario')}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 font-semibold transition-all whitespace-nowrap text-xs sm:text-sm md:text-base border-b-4 ${
                  vista === 'calendario'
                    ? 'border-primary-600 text-primary-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-800 bg-gray-50'
                }`}
              >
                <i className="fas fa-calendar-alt mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Precios</span>
                <span className="sm:hidden">Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full py-4 sm:py-6 md:py-8 pt-16 sm:pt-20 md:pt-24">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        ) : (
          <div className="pt-16 sm:pt-20 md:pt-24">
            <>
            {/* VISTA: RESERVACIONES */}
            {vista === 'reservaciones' && (
              <div className="space-y-4 sm:space-y-6">
                
                {/* Próximas Reservaciones - Estilo Airbnb */}
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    {reservasProximas.length === 0 
                      ? 'No hay reservaciones próximas' 
                      : `Tienes ${reservasProximas.length} reservación${reservasProximas.length !== 1 ? 'es' : ''} programada${reservasProximas.length !== 1 ? 's' : ''}`}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
                    {reservasProximas.length === 0 
                      ? 'En los próximos 30 días'
                      : 'Próximas llegadas'}
                  </p>
                  
                  {reservasProximas.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 sm:p-12 text-center">
                      <i className="fas fa-calendar text-5xl sm:text-6xl text-gray-200 mb-4"></i>
                      <p className="text-base sm:text-lg text-gray-500">No hay reservaciones en los próximos 30 días</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {reservasProximas.map((reserva) => (
                        <div
                          key={reserva.id}
                          className="bg-white rounded-lg p-3 shadow-sm border border-gray-400 hover:shadow-md transition-shadow"
                        >
                          {/* Header compacto */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {reserva.usuario_nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-gray-900 truncate">
                                {reserva.usuario_nombre}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {new Date(reserva.fecha_entrada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(reserva.fecha_salida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>

                          {/* Info compacta */}
                          <div className="text-xs text-gray-600 space-y-1 mb-2">
                            <div className="flex items-center gap-1">
                              <i className="fas fa-users w-3 text-primary-600"></i>
                              <span>{reserva.num_personas} personas</span>
                            </div>
                            {reserva.usuario_telefono && (
                              <div className="flex items-center gap-1">
                                <i className="fas fa-phone w-3 text-primary-600"></i>
                                <span className="truncate">{reserva.usuario_telefono}</span>
                              </div>
                            )}
                          </div>

                          {/* Precio */}
                          <div className="pt-2 border-t border-gray-100 text-center">
                            <p className="text-sm font-bold text-primary-600">
                              Q{Number(reserva.precio_total).toLocaleString('es-GT')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <hr className="border-gray-300" />

                {/* Todas las Reservaciones */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    <i className="fas fa-list text-primary-600 mr-2"></i>
                    Todas las Reservaciones
                  </h2>

                  {/* Botones de Vista */}
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setVerHistorial(false)}
                    className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-colors text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                      !verHistorial
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-hourglass-end"></i>
                    <span className="hidden sm:inline">Pendientes</span>
                    <span className="sm:hidden">Pend.</span>
                    {reservasPendientes.length > 0 && (
                      <span className={`ml-1 sm:ml-2 px-2 py-0.5 sm:py-1 rounded text-xs font-bold ${
                        !verHistorial ? 'bg-white text-primary-600' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {reservasPendientes.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setVerHistorial(true)}
                    className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-colors text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                      verHistorial
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-history"></i>
                    <span className="hidden sm:inline">Historial</span>
                    <span className="sm:hidden">Hist.</span>
                    {reservasHistorial.length > 0 && (
                      <span className={`ml-1 sm:ml-2 px-2 py-0.5 sm:py-1 rounded text-xs font-bold ${
                        verHistorial ? 'bg-white text-primary-600' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {reservasHistorial.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Lista de Reservas */}
                {reservasAMostrar.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 sm:p-12 text-center">
                    <i className={`fas text-4xl sm:text-5xl mb-4 ${
                      verHistorial ? 'fa-inbox text-gray-400' : 'fa-check-circle text-green-400'
                    }`}></i>
                    <p className="text-sm sm:text-base text-gray-600">
                      {verHistorial ? 'No hay historial' : 'No hay reservaciones pendientes'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 sm:space-y-4">
                      {reservasEnPagina.map((reserva) => (
                      <div
                        key={reserva.id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        {/* Header compacto */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {reserva.usuario_nombre}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{reserva.usuario_email}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ml-2 ${
                            reserva.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                            reserva.estado === 'cancelada' ? 'bg-red-100 text-red-700' :
                            reserva.estado === 'completada' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                          </span>
                        </div>

                        {/* Info compacta */}
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-calendar w-3 text-primary-600"></i>
                            <span>{new Date(reserva.fecha_entrada).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {new Date(reserva.fecha_salida).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-users w-3 text-primary-600"></i>
                            <span>{reserva.num_personas} personas</span>
                          </div>
                          {reserva.usuario_telefono && (
                            <div className="flex items-center gap-1 col-span-2">
                              <i className="fas fa-phone w-3 text-primary-600"></i>
                              <span>{reserva.usuario_telefono}</span>
                            </div>
                          )}
                        </div>

                        {/* Precio y acciones */}
                        <div className="flex justify-between items-center">
                          <div className="text-base font-bold text-primary-600">
                            Q{Number(reserva.precio_total).toLocaleString('es-GT')}
                          </div>
                          
                          <div className="flex gap-2">
                            {reserva.estado === 'pendiente' && (
                              <>
                                <button
                                  onClick={() => cambiarEstado(reserva.id, 'confirmada')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  <i className="fas fa-check mr-1"></i> Aprobar
                                </button>
                                <button
                                  onClick={() => cambiarEstado(reserva.id, 'cancelada')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  <i className="fas fa-times mr-1"></i> Rechazar
                                </button>
                              </>
                            )}
                            {verHistorial && reserva.estado === 'confirmada' && (
                              <button
                                onClick={() => cambiarEstado(reserva.id, 'completada')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                              >
                                <i className="fas fa-credit-card mr-1"></i> Marcar Pagada
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>

                    {/* Paginación */}
                    {totalPaginas > 1 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-6 border-t">
                        <div className="text-xs sm:text-sm text-gray-600">
                          Mostrando {indiceInicial + 1} a {Math.min(indiceFinal, reservasAMostrar.length)} de {reservasAMostrar.length} reservas
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-wrap">
                          <button
                            onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                            disabled={paginaActual === 1}
                            className="px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                          
                          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setPaginaActual(page)}
                              className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                                paginaActual === page
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                            disabled={paginaActual === totalPaginas}
                            className="px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                </div>
              </div>
            )}

            {/* VISTA: CALENDARIO */}
            {vista === 'calendario' && (
              <div className="space-y-4">
                {mensajeGuardado && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <i className="fas fa-check-circle mr-2"></i>
                    {mensajeGuardado}
                  </div>
                )}
                
                {errorGuardado && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {errorGuardado}
                  </div>
                )}
                
                {renderizarCalendario()}
                
                {(Object.keys(preciosPorNoche).length > 0 || Object.keys(nochesBloquedas).length > 0) && (
                  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 flex flex-col sm:flex-row gap-2 sm:gap-3 sticky bottom-0 sm:static">
                    <button
                      onClick={guardarCambiosPrecios}
                      disabled={guardandoPrecios}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                    >
                      {guardandoPrecios ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span className="hidden sm:inline">Guardando...</span>
                          <span className="sm:hidden">Guard...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          <span className="hidden sm:inline">Guardar Cambios</span>
                          <span className="sm:hidden">Guardar</span>
                          <span className="ml-1 text-xs bg-white bg-opacity-30 px-2 py-0.5 rounded">({Object.keys(preciosPorNoche).length + Object.keys(nochesBloquedas).length})</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setPreciosPorNoche({});
                        setNochesBloquedas({});
                        setComentariosNoches({});
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                    >
                      <i className="fas fa-times"></i>
                      <span className="hidden sm:inline">Cancelar</span>
                      <span className="sm:hidden">Canc.</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            </>
          </div>
        )}
        </div>
        </div>
      </div>
      
      {/* Modal de confirmación de reservas */}
      {modalReserva.mostrar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 text-center animate-in slide-in-from-bottom duration-300">
            {modalReserva.tipo === 'exito' ? (
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check text-3xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">¡Operación exitosa!</h3>
                <p className="text-gray-600">{modalReserva.mensaje}</p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-3xl text-red-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
                <p className="text-gray-600">{modalReserva.mensaje}</p>
              </div>
            )}
            
            <button
              onClick={() => setModalReserva({ mostrar: false, tipo: '', mensaje: '' })}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
