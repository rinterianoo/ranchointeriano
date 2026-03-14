import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  const propiedadId = 1; // ID de la propiedad Rancho Interiano
  
  // Cargar reseñas del backend
  useEffect(() => {
    const cargarResenas = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/resenas/propiedad/${propiedadId}`);
        const data = await response.json();
        if (response.ok) {
          setReviews(data.resenas || []);
        }
      } catch (error) {
        console.error('Error al cargar reseñas:', error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    cargarResenas();
  }, []);
  
  const heroImages = [
    '/images/propiedades/casa-principal.jpg',
    '/images/propiedades/piscina.jpg',
    '/images/propiedades/cuartoprincipal.jpg',
    '/images/propiedades/cuartosecundario.jpg',
    '/images/propiedades/salacomedorcocina.jpg',
    '/images/propiedades/cocina.jpg',
    '/images/propiedades/churrasquera.jpg',
    '/images/propiedades/pergola.jpg',
    '/images/propiedades/baño.jpg',
    '/images/propiedades/bañopiscina.jpg',
    '/images/propiedades/duchafuera.jpg',
    '/images/propiedades/IMG-20251207-WA0010.jpg',
    '/images/propiedades/IMG-20251207-WA0013.jpg',
    '/images/propiedades/WhatsApp Image 2026-03-13 at 11.15.57 AM (1).jpeg',
    '/images/propiedades/WhatsApp Image 2026-03-13 at 11.15.58 AM.jpeg',
    '/images/propiedades/WhatsApp Image 2026-03-13 at 11.15.59 AM.jpeg',
    '/images/propiedades/WhatsApp Image 2026-03-13 at 11.16.00 AM (1).jpeg',
    '/images/propiedades/WhatsApp Image 2026-03-13 at 11.16.00 AM (2).jpeg',
    '/images/propiedades/WhatsApp Image 2026-03-13 at 11.16.00 AM (3).jpeg',
    '/images/propiedades/WhatsApp Image 2026-03-13 at 11.16.00 AM.jpeg'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const amenidades = [
    { icon: 'fas fa-wifi', label: 'WiFi', desc: 'Internet de alta velocidad' },
    { icon: 'fas fa-utensils', label: 'Cocina', desc: 'Completamente equipada' },
    { icon: 'fas fa-swimming-pool', label: 'Piscina', desc: 'Piscina privada' },
    { icon: 'fas fa-snowflake', label: 'Aire Acondicionado', desc: 'En todas las habitaciones' },
    { icon: 'fas fa-bed', label: '2 Habitaciones', desc: 'Cómodas y limpias' },
    { icon: 'fas fa-bath', label: 'Baños', desc: 'Modernos y equipados' },
    { icon: 'fas fa-car', label: 'Estacionamiento', desc: 'Área techada' },
    { icon: 'fas fa-tree', label: 'Jardín', desc: 'Tropical con palmeras' },
    { icon: 'fas fa-utensils', label: 'Área para churrasqueo', desc: 'BBQ disponible' },
    { icon: 'fas fa-moon', label: 'Descanso', desc: 'Ambiente tranquilo' }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section con Carrusel */}
      <div className="relative h-64 sm:h-80 md:h-[500px] lg:h-[600px] overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={image} 
              alt={`Monterrico ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Overlay con información */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center">
          <div className="text-white p-4 sm:p-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
              Rancho Interiano
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-center mb-6 sm:mb-8 max-w-2xl">
              Casa vacacional en Monterrico con piscina privada, aire acondicionado y todas las comodidades para unas vacaciones perfectas.
            </p>
            <div className="flex justify-center">
              <Link
                to="/reservar#formulario-reserva"
                className="inline-block bg-white text-primary-600 px-6 sm:px-12 py-3 sm:py-5 rounded-lg text-base sm:text-2xl font-bold hover:bg-gray-100 transition-colors shadow-lg z-10 relative"
              >
                <i className="fas fa-calendar-check mr-2"></i>
                Reservar Ahora
              </Link>
            </div>
          </div>
        </div>

        {/* Indicadores del carrusel */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white sm:w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Descripción Principal */}
      <div className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Alojamiento en Monterrico
            </h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base text-gray-600">
              <span><i className="fas fa-star text-yellow-400 mr-1"></i>5 estrellas</span>
              <span><i className="fas fa-users text-primary-600 mr-1"></i>Hasta 10 personas</span>
              <span><i className="fas fa-door-open text-primary-600 mr-1"></i>2 habitaciones</span>
            </div>
          </div>
          
          <p className="text-base sm:text-lg text-gray-700 text-center max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Un refugio tropical en Playa con todos los servicios modernos. Un lugar perfecto para descansar, disfrutar en familia o con amigos. Cuenta con amplias áreas de convivencia, hermosas vistas y acceso directo a la naturaleza.
          </p>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">2</p>
              <p className="text-sm sm:text-base text-gray-600">Habitaciones</p>
            </div>
            <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">2</p>
              <p className="text-sm sm:text-base text-gray-600">Baños</p>
            </div>
            <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">10</p>
              <p className="text-sm sm:text-base text-gray-600">Huéspedes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Características Principales */}
      <div className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            ¿Por qué elegir Rancho Interiano?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-primary-600 text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-5">
                <i className="fas fa-snowflake"></i>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-gray-800">Aire Acondicionado</h3>
              <p className="text-sm sm:text-base md:text-base text-gray-600 leading-relaxed">
                Automático disponible para tu comodidad.
              </p>
            </div>
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-primary-600 text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-5">
                <i className="fas fa-swimming-pool"></i>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-gray-800">Piscina Privada</h3>
              <p className="text-sm sm:text-base md:text-base text-gray-600 leading-relaxed">
                Hermosa piscina con área de descanso.
              </p>
            </div>
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-primary-600 text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-5">
                <i className="fas fa-bed"></i>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-gray-800">Comodidad</h3>
              <p className="text-sm sm:text-base md:text-base text-gray-600 leading-relaxed">
                Todas las amenidades que necesitas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dónde vas a dormir */}
      <div className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            ¿Dónde vas a dormir?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Habitación 1 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <img 
                src="/images/propiedades/cuartoprincipal.jpg" 
                alt="Habitación 1"
                className="w-full h-48 sm:h-56 md:h-64 object-cover"
              />
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">Habitación 1</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  2 camas dobles. Aire acondicionado y espacio amplio.
                </p>
                <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                  <li><i className="fas fa-check text-primary-600 mr-2"></i>Camas dobles</li>
                  <li><i className="fas fa-check text-primary-600 mr-2"></i>Aire acondicionado</li>
                  <li><i className="fas fa-check text-primary-600 mr-2"></i>Ventilador</li>
                </ul>
              </div>
            </div>

            {/* Habitación 2 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <img 
                src="/images/propiedades/cuartosecundario.jpg" 
                alt="Habitación 2"
                className="w-full h-48 sm:h-56 md:h-64 object-cover"
              />
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">Habitación 2</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  1 cama doble. Aire acondicionado.
                </p>
                <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                  <li><i className="fas fa-check text-primary-600 mr-2"></i>Cama doble</li>
                  <li><i className="fas fa-check text-primary-600 mr-2"></i>Aire acondicionado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lo que este lugar ofrece */}
      <div className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Lo que este lugar ofrece
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {amenidades.map((amenidad, index) => (
              <div key={index} className="flex items-start p-4 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                <i className={`${amenidad.icon} text-primary-600 text-xl sm:text-2xl mr-4 mt-1 flex-shrink-0`}></i>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-gray-800">{amenidad.label}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{amenidad.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ubicación Google Maps */}
      <div className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Ubicación
          </h2>
          <div className="rounded-lg overflow-hidden shadow-lg h-64 sm:h-80 md:h-96">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              title="Google Maps - Rancho Interiano"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.40237058917!2d-90.43255169999999!3d13.8748726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8588690055563557%3A0x77a5ab1552723e65!2sRancho%20Interiano!5e0!3m2!1ses-419!2sgt!4v1773449579404!5m2!1ses-419!2sgt"
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="mt-6 p-4 sm:p-6 bg-gray-50 rounded-lg">
            <p className="text-sm sm:text-base text-gray-700"><i className="fas fa-map-marker-alt text-primary-600 mr-2"></i><strong>Ubicación:</strong> Ubicado en la zona de Monterrico, Guatemala, en una zona tranquila y segura.</p>
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <div className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 sm:mb-4 text-gray-800">
            Reseñas de Huéspedes
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-8 sm:mb-12">
            {reviews.length === 0 && !loadingReviews ? 'Sé el primero en compartir tu experiencia' : `${reviews.length} ${reviews.length === 1 ? 'reseña' : 'reseñas'}`}
          </p>
          
          {loadingReviews ? (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
              <p className="text-gray-600">Cargando reseñas...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <i className="fas fa-comments text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No hay reseñas aún. ¡Sé el primero!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                  {review.imagen && (
                    <img 
                      src={review.imagen} 
                      alt={`Foto de ${review.nombre}`}
                      className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-user text-primary-600 text-sm sm:text-base"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm sm:text-base text-gray-800">{review.nombre}</h3>
                      {review.ubicacion && <p className="text-xs sm:text-sm text-gray-600">{review.ubicacion}</p>}
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star text-xs sm:text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                    ))}
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-700 mb-3 leading-relaxed">{review.texto}</p>
                  <p className="text-xs text-gray-500">{review.fecha}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lo que debes saber */}
      <div className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Lo que debes saber
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Regla de la casa */}
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-4 flex items-center">
                <i className="fas fa-house-user text-primary-600 mr-3"></i>
                Reglas de la casa
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                <li><i className="fas fa-check text-primary-600 mr-2"></i>Check-in: 3:00 PM</li>
                <li><i className="fas fa-check text-primary-600 mr-2"></i>Check-out: 11:00 AM</li>
                <li><i className="fas fa-check text-primary-600 mr-2"></i>No fumar en interiores</li>
              </ul>
            </div>

            {/* Cancelación */}
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-4 flex items-center">
                <i className="fas fa-times-circle text-primary-600 mr-3"></i>
                Política de cancelación
              </h3>
              <p className="text-sm sm:text-base text-gray-700 mb-2">
                Cancela hasta 3 días antes de tu llegada para una reembolso completo.
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Las cancelaciones posteriores estarán sujetas a la política de reembolso parcial.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seguridad y propiedad */}
      <div className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Seguridad y propiedad
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 flex items-center">
                <i className="fas fa-camera text-primary-600 mr-3"></i>
                Seguridad de la propiedad
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                <li><i className="fas fa-check-circle text-primary-600 mr-2"></i>Cámaras de seguridad en el exterior</li>
              </ul>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 flex items-center">
                <i className="fas fa-eye text-primary-600 mr-3"></i>
                Dentro de la casa
              </h3>
              <p className="text-sm sm:text-base text-gray-700 mb-3">
                Se puede usar la cocina libremente. Las bebidas alcohólicas están permitidas.
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Se solicita mantener la casa limpia y en orden durante tu estancia.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="py-8 sm:py-12 md:py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
            ¿Listo para tus vacaciones?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white mb-4 sm:mb-8">
            Reserva hoy mismo y disfruta del paraíso
          </p>
          <Link
            to="/reservar#formulario-reserva"
            className="inline-block bg-white text-primary-600 px-6 sm:px-12 py-3 sm:py-5 rounded-lg text-base sm:text-2xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Reservar Ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
