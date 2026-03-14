import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { propiedadesService, reservasService, preciosService } from '../services/services';
import Calendar from '../components/Calendar';
import ImageCarousel from '../components/ImageCarousel';

const Reservar = () => {
  const location = useLocation();
  const formularioRef = useRef(null);
  const [propiedades, setPropiedades] = useState([]);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  const [formData, setFormData] = useState({
    fecha_entrada: '',
    fecha_salida: '',
    num_personas: 1,
    comentarios: '',
    nombre: '',
    email: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [numNoches, setNumNoches] = useState(0);
  const [preciosPorNoche, setPreciosPorNoche] = useState({});
  const [precioBase, setPrecioBase] = useState(0);

  useEffect(() => {
    cargarPropiedades();
  }, []);

  useEffect(() => {
    if (propiedadSeleccionada) {
      cargarFechasOcupadas();
    }
  }, [propiedadSeleccionada]);

  useEffect(() => {
    calcularPrecio();
  }, [formData.fecha_entrada, formData.fecha_salida, propiedadSeleccionada]);

  useEffect(() => {
    if (location.hash === '#formulario-reserva' && formularioRef.current) {
      // Scroll con offset para compensar el navbar fijo
      const navbarHeight = 100; // Altura aproximada del navbar + margen
      const elementPosition = formularioRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [location.hash, propiedadSeleccionada]);

  const cargarPropiedades = async () => {
    try {
      const data = await propiedadesService.getAll();
      setPropiedades(data.propiedades);
      if (data.propiedades.length > 0) {
        setPropiedadSeleccionada(data.propiedades[0]);
      }
    } catch (err) {
      setError('Error al cargar propiedades');
    }
  };

  const cargarFechasOcupadas = async () => {
    try {
      const data = await reservasService.getFechasOcupadas(propiedadSeleccionada.id);
      setFechasOcupadas(data.fechas_ocupadas);
    } catch (err) {
      // Error silencioso
    }
  };

  const calcularPrecio = async () => {
    if (propiedadSeleccionada && formData.fecha_entrada && formData.fecha_salida) {
      const entrada = new Date(formData.fecha_entrada);
      const salida = new Date(formData.fecha_salida);
      const noches = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
      
      if (noches > 0) {
        setNumNoches(noches);
        
        try {
          // Cargar precios dinámicos
          const data = await preciosService.obtenerPrecios(
            propiedadSeleccionada.id,
            formData.fecha_entrada,
            formData.fecha_salida
          );
          
          setPrecioBase(data.precioBase);
          
          // Verificar si hay fechas bloqueadas en el rango
          const fechasBlockeadas = data.precios.filter(p => p.estado === 'bloqueada');
          if (fechasBlockeadas.length > 0) {
            setPrecioTotal(0);
            setError(`Las siguientes fechas no están disponibles: ${fechasBlockeadas.map(f => f.fecha).join(', ')}`);
            return;
          }
          
          // Crear mapa de precios desde precios_noche
          const preciosPersonalizados = {};
          data.precios.forEach(p => {
            if (p.estado !== 'bloqueada') {
              // Normalizar fecha al formato ISO YYYY-MM-DD
              // La fecha puede venir como "2026-03-25" o "2026-03-25T00:00:00Z"
              const fechaNormalizada = p.fecha.split('T')[0];
              preciosPersonalizados[fechaNormalizada] = Number(p.precio);
            }
          });
          setPreciosPorNoche(preciosPersonalizados);
          
          // Calcular total sumando precios de cada noche
          let total = 0;
          let fecha = new Date(entrada);
          let desglose = [];
          
          while (fecha < salida) {
            const fechaStr = fecha.toISOString().split('T')[0];
            const precioEnMapa = preciosPersonalizados[fechaStr];
            const precio = precioEnMapa !== undefined ? precioEnMapa : data.precioBase;
            
            desglose.push({ fecha: fechaStr, precio });
            total += Number(precio);
            fecha.setDate(fecha.getDate() + 1);
          }
          
          setPrecioTotal(total);
          setError(''); // Limpiar error si todo está bien
        } catch (err) {
          // Usar precio base del formulario si el servicio falla
          const precioBase = Number(propiedadSeleccionada.precio_noche);
          setPrecioBase(precioBase);
          setPrecioTotal(noches * precioBase);
          setPreciosPorNoche({});
        }
      } else {
        setNumNoches(0);
        setPrecioTotal(0);
        setPreciosPorNoche({});
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectDates = (fechaEntrada, fechaSalida) => {
    setFormData({
      ...formData,
      fecha_entrada: fechaEntrada,
      fecha_salida: fechaSalida
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.telefono) {
      setError('Por favor completa todos tus datos de contacto');
      return;
    }

    try {
      setCargando(true);
      setError('');
      
      const datosReserva = {
        propiedad_id: propiedadSeleccionada.id,
        ...formData,
        precio_total: precioTotal  // Enviar precio calculado con precios dinámicos
      };

      console.log('Enviando reserva...', datosReserva);
      
      const response = await reservasService.crear(datosReserva);
      
      console.log('Reserva creada exitosamente:', response);
      
      setExito('¡Reserva creada exitosamente! Te contactaremos pronto.');
      
      // Limpiar formulario
      setFormData({
        fecha_entrada: '',
        fecha_salida: '',
        num_personas: 1,
        comentarios: '',
        nombre: '',
        email: '',
        telefono: ''
      });
      setPrecioTotal(0);
      setNumNoches(0);
    } catch (err) {
      console.error('Error al crear reserva:', err);
      
      // Manejo más detallado de errores
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        setError('Error de conexión. Tu reserva podría haberse creado. Por favor, llámanos para confirmar.');
      } else if (err.response?.status >= 500) {
        setError('Error del servidor. Tu reserva podría haberse creado. Te contactaremos si se procesó correctamente.');
      } else {
        setError(err.response?.data?.mensaje || err.message || 'Error al crear reserva');
      }
    } finally {
      setCargando(false);
    }
  };

  const esFechaOcupada = (fecha) => {
    const fechaCheck = new Date(fecha);
    return fechasOcupadas.some(reserva => {
      const entrada = new Date(reserva.fecha_entrada);
      const salida = new Date(reserva.fecha_salida);
      return fechaCheck >= entrada && fechaCheck <= salida;
    });
  };

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    return hoy.toISOString().split('T')[0];
  };

  if (!propiedadSeleccionada) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
          <p>Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de éxito */}
      {exito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fadeIn">
            <div className="text-6xl text-green-500 mb-4">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Éxito!</h2>
            <p className="text-gray-600 mb-6 text-lg">{exito}</p>
            <div className="space-y-3">
              <button
                onClick={() => setExito('')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <i className="fas fa-home mr-2"></i>
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-6 md:py-12 pt-28 md:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
          <i className="fas fa-calendar-check text-primary-600 mr-3"></i>
          Reservar Rancho Interiano
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Información de la propiedad */}
          <div id="formulario-reserva" ref={formularioRef} className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Rancho Interiano - Paraíso en la Playa</h2>
            
            {/* Carrusel de imágenes */}
            <div className="mb-6">
              <ImageCarousel />
            </div>

            {/* Características principales */}
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-700">
                <i className="fas fa-map-marker-alt text-primary-600 w-6 mr-3"></i>
                {propiedadSeleccionada.direccion}
              </div>
              <div className="flex items-center text-gray-700">
                <i className="fas fa-users text-primary-600 w-6 mr-3"></i>
                Capacidad: {propiedadSeleccionada.capacidad_personas} personas
              </div>
              <div className="flex items-center text-gray-700">
                <i className="fas fa-bed text-primary-600 w-6 mr-3"></i>
                {propiedadSeleccionada.num_habitaciones} habitaciones
              </div>
              <div className="flex items-center text-gray-700">
                <i className="fas fa-bath text-primary-600 w-6 mr-3"></i>
                {propiedadSeleccionada.num_banos} baños
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-300 text-cyan-900 px-4 py-3 rounded mb-6">
              <i className="fas fa-snowflake mr-2 text-cyan-600"></i>
              <span className="font-semibold">Aire Acondicionado Automático:</span> Se enciende a las 9:00 PM y se apaga a las 9:00 AM del siguiente día.
            </div>

            <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded mb-6">
              <div className="space-y-1">
                <div className="font-semibold">Entrada:</div>
                <div>3:00 PM</div>
                <div className="font-semibold mt-2">Salida:</div>
                <div>11:00 AM</div>
              </div>
            </div>
          </div>

          {/* Formulario de reserva */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-6">Detalles de la Reserva</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-user mr-2"></i>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-envelope mr-2"></i>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-phone mr-2"></i>
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+502 1234-5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <i className="fas fa-calendar-day mr-2"></i>
                  Selecciona tus fechas de hospedaje
                </label>

                <Calendar 
                  fechasOcupadas={fechasOcupadas}
                  onSelectDates={handleSelectDates}
                  propiedadId={propiedadSeleccionada.id}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-users mr-2"></i>
                  Número de Personas
                </label>
                <input
                  type="number"
                  name="num_personas"
                  value={formData.num_personas}
                  onChange={handleChange}
                  min="1"
                  max={propiedadSeleccionada.capacidad_personas}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-comment mr-2"></i>
                  Comentarios (opcional)
                </label>
                <textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Alguna solicitud especial..."
                ></textarea>
              </div>

              {numNoches > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Número de noches:</span>
                    <span className="font-semibold">{numNoches}</span>
                  </div>
                  
                  {Object.keys(preciosPorNoche).length > 0 && (
                    <div className="border-t pt-2 space-y-1 text-sm mb-2">
                      <p className="font-semibold text-gray-700">Desglose por noche:</p>
                      {Array.from({ length: numNoches }, (_, i) => {
                        const fecha = new Date(formData.fecha_entrada);
                        fecha.setDate(fecha.getDate() + i);
                        const fechaStr = fecha.toISOString().split('T')[0];
                        const precio = preciosPorNoche[fechaStr] || precioBase;
                        return (
                          <div key={fechaStr} className="flex justify-between text-gray-600">
                            <span>
                              Noche {i + 1} ({fecha.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}):
                            </span>
                            <span>Q{Number(precio).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="border-t pt-2 flex justify-between text-lg font-bold text-primary-600">
                    <span>Total:</span>
                    <span>Q{precioTotal.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={cargando || !formData.fecha_entrada || !formData.fecha_salida}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Procesando...
                  </>
                ) : !formData.fecha_entrada || !formData.fecha_salida ? (
                  <>
                    <i className="fas fa-calendar-check mr-2"></i>
                    Selecciona las fechas
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle mr-2"></i>
                    Enviar Solicitud de Reserva
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Reservar;
