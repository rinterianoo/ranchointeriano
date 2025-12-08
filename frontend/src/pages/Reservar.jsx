import { useState, useEffect } from 'react';
import { propiedadesService, reservasService } from '../services/services';

const Reservar = () => {
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
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [numNoches, setNumNoches] = useState(0);

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
      console.error('Error al cargar fechas ocupadas:', err);
    }
  };

  const calcularPrecio = () => {
    if (propiedadSeleccionada && formData.fecha_entrada && formData.fecha_salida) {
      const entrada = new Date(formData.fecha_entrada);
      const salida = new Date(formData.fecha_salida);
      const noches = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
      
      if (noches > 0) {
        setNumNoches(noches);
        setPrecioTotal(noches * propiedadSeleccionada.precio_noche);
      } else {
        setNumNoches(0);
        setPrecioTotal(0);
      }
    }
  };

  const verificarDisponibilidad = async () => {
    if (!formData.fecha_entrada || !formData.fecha_salida) {
      setError('Por favor selecciona las fechas');
      return;
    }

    try {
      setCargando(true);
      setError('');
      const data = await reservasService.verificarDisponibilidad(
        propiedadSeleccionada.id,
        formData.fecha_entrada,
        formData.fecha_salida
      );
      setDisponibilidad(data);
    } catch (err) {
      setError('Error al verificar disponibilidad');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setDisponibilidad(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!disponibilidad?.disponible) {
      setError('Por favor verifica la disponibilidad primero');
      return;
    }

    if (!formData.nombre || !formData.email || !formData.telefono) {
      setError('Por favor completa todos tus datos de contacto');
      return;
    }

    try {
      setCargando(true);
      setError('');
      
      const datosReserva = {
        propiedad_id: propiedadSeleccionada.id,
        ...formData
      };

      await reservasService.crear(datosReserva);
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
      setDisponibilidad(null);
      setPrecioTotal(0);
      setNumNoches(0);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear reserva');
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          <i className="fas fa-calendar-check text-primary-600 mr-3"></i>
          Reservar Casa Vacacional
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información de la propiedad */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{propiedadSeleccionada.nombre}</h2>
            
            {/* Imagen principal */}
            <div className="bg-gray-200 h-96 rounded-lg mb-4 overflow-hidden">
              {propiedadSeleccionada.imagen_principal ? (
                <img 
                  src={propiedadSeleccionada.imagen_principal} 
                  alt={propiedadSeleccionada.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fas fa-image text-6xl text-gray-400"></i>
                </div>
              )}
            </div>

            {/* Galería de fotos */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Galería de Fotos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Habitaciones */}
                <div className="relative group">
                  <img src="/images/propiedades/cuartoprincipal.jpg" alt="Habitación Principal" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Habitación Principal</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/cuartoprincipal2.jpg" alt="Habitación Principal Vista 2" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Habitación Principal</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/cuartosecundario.jpg" alt="Habitación Secundaria" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Habitación Secundaria</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/cuartosecundario2.jpg" alt="Habitación Secundaria 2" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Habitación Secundaria</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/cuartosecundario3.jpg" alt="Habitación Secundaria 3" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Habitación Secundaria</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/cuartotres.jpg" alt="Tercer Cuarto" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Tercer Cuarto</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/cuartotres2.jpg" alt="Tercer Cuarto Vista 2" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Tercer Cuarto</p>
                  </div>
                </div>

                {/* Baños */}
                <div className="relative group">
                  <img src="/images/propiedades/baño.jpg" alt="Baño" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Baño</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/bañoprivado.jpg" alt="Baño Privado" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Baño Privado</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/bañopiscina.jpg" alt="Baño junto a Piscina" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Baño Piscina</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/duchafuera.jpg" alt="Ducha Exterior" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Ducha Exterior</p>
                  </div>
                </div>

                {/* Áreas comunes */}
                <div className="relative group">
                  <img src="/images/propiedades/salacomedorcocina.jpg" alt="Sala, Comedor y Cocina" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Sala, Comedor y Cocina</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/cocina.jpg" alt="Cocina Equipada" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Cocina Equipada</p>
                  </div>
                </div>

                {/* Áreas recreativas */}
                <div className="relative group">
                  <img src="/images/propiedades/piscina.jpg" alt="Piscina Privada" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Piscina Privada</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/pergola.jpg" alt="Pérgola" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Pérgola</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/churrasquera.jpg" alt="Churrasquera/BBQ" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Churrasquera/BBQ</p>
                  </div>
                </div>

                {/* Exteriores */}
                <div className="relative group">
                  <img src="/images/propiedades/casaafuera.jpg" alt="Vista Exterior" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Vista Exterior</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0010.jpg" alt="Jardín y Áreas Verdes" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Jardín y Áreas Verdes</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0013.jpg" alt="Estacionamiento" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Estacionamiento</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0020.jpg" alt="Áreas Verdes" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Áreas Verdes</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0024.jpg" alt="Jardín Tropical" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Jardín Tropical</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0025.jpg" alt="Vista del Jardín" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Vista del Jardín</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0026.jpg" alt="Área de Parqueo" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Área de Parqueo</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0027.jpg" alt="Terraza" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Terraza</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0028.jpg" alt="Exteriores" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Exteriores</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0031.jpg" alt="Vista Panorámica" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Vista Panorámica</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0032.jpg" alt="Zona de Descanso" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Zona de Descanso</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0033.jpg" alt="Entrada" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Entrada</p>
                  </div>
                </div>
                <div className="relative group">
                  <img src="/images/propiedades/IMG-20251207-WA0034.jpg" alt="Ambiente Tropical" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-semibold text-center px-2">Ambiente Tropical</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{propiedadSeleccionada.descripcion}</p>
            
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

            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Precio por noche:</span>
                <span className="text-2xl font-bold text-primary-600">
                  Q{propiedadSeleccionada.precio_noche.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Formulario de reserva */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Detalles de la Reserva</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}
            
            {exito && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <i className="fas fa-check-circle mr-2"></i>
                {exito}
              </div>
            )}

            {disponibilidad && (
              <div className={`px-4 py-3 rounded mb-4 ${
                disponibilidad.disponible 
                  ? 'bg-green-100 border border-green-400 text-green-700' 
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                <i className={`fas ${disponibilidad.disponible ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                {disponibilidad.mensaje}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-calendar-day mr-2"></i>
                  Fecha de Entrada
                </label>
                <input
                  type="date"
                  name="fecha_entrada"
                  value={formData.fecha_entrada}
                  onChange={handleChange}
                  min={obtenerFechaMinima()}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-calendar-day mr-2"></i>
                  Fecha de Salida
                </label>
                <input
                  type="date"
                  name="fecha_salida"
                  value={formData.fecha_salida}
                  onChange={handleChange}
                  min={formData.fecha_entrada || obtenerFechaMinima()}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                  <div className="flex justify-between text-gray-700">
                    <span>Precio por noche:</span>
                    <span className="font-semibold">Q{propiedadSeleccionada.precio_noche.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold text-primary-600">
                    <span>Total:</span>
                    <span>Q{precioTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={verificarDisponibilidad}
                disabled={cargando || !formData.fecha_entrada || !formData.fecha_salida}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-search mr-2"></i>
                Verificar Disponibilidad
              </button>

              <button
                type="submit"
                disabled={cargando || !disponibilidad?.disponible}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle mr-2"></i>
                    Confirmar Reserva
                  </>
                )}
              </button>
            </form>

            {/* Leyenda de fechas ocupadas */}
            {fechasOcupadas.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-info-circle mr-2"></i>
                  Fechas No Disponibles
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {fechasOcupadas.slice(0, 5).map((reserva, index) => (
                    <div key={index}>
                      Del {new Date(reserva.fecha_entrada).toLocaleDateString()} al {new Date(reserva.fecha_salida).toLocaleDateString()}
                    </div>
                  ))}
                  {fechasOcupadas.length > 5 && (
                    <div className="text-gray-500 italic">
                      y {fechasOcupadas.length - 5} más...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservar;
