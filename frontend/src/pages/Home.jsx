import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroImages = [
    '/images/propiedades/casa-principal.jpg',
    '/images/propiedades/piscina.jpg',
    '/images/propiedades/cuartoprincipal.jpg',
    '/images/propiedades/salacomedorcocina.jpg',
    '/images/propiedades/churrasquera.jpg',
    '/images/propiedades/IMG-20251207-WA0010.jpg'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section con Carrusel */}
      <div className="relative h-[600px] overflow-hidden">
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
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
        ))}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white animate-fadeIn">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Bienvenido a Monterrico
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl">
              Descubre el paraíso en la costa del Pacífico. Tu casa vacacional perfecta te espera.
            </p>
            <Link
              to="/reservar"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-calendar-check mr-2"></i>
              Reservar Ahora
            </Link>
          </div>
        </div>
        
        {/* Indicadores del carrusel */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Características */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            ¿Por qué elegir nuestra casa vacacional?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-primary-600 text-5xl mb-4">
                <i className="fas fa-water"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Frente al Mar</h3>
              <p className="text-gray-600">
                Disfruta de vistas espectaculares y acceso directo a la playa.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-primary-600 text-5xl mb-4">
                <i className="fas fa-swimming-pool"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Piscina Privada</h3>
              <p className="text-gray-600">
                Relájate en nuestra hermosa piscina con área de descanso.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-primary-600 text-5xl mb-4">
                <i className="fas fa-bed"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comodidad Total</h3>
              <p className="text-gray-600">
                Habitaciones cómodas con todas las amenidades que necesitas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para tus vacaciones soñadas?
          </h2>
          <p className="text-xl text-white mb-8">
            Verifica la disponibilidad y reserva hoy mismo
          </p>
          <Link
            to="/reservar"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Ver Disponibilidad
          </Link>
        </div>
      </div>

      {/* Secciones alternadas con imágenes */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* Sección 1: Un Refugio Tropical - Imagen a la derecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Un Refugio Tropical en Monterrico
              </h2>
              <p className="text-gray-600 mb-4">
                Nuestra casa vacacional en Monterrico ofrece el escape perfecto para familias y grupos.
                Con capacidad para 8-10 personas, cuenta con todas las comodidades para una estadía inolvidable.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  3 habitaciones amplias con aire acondicionado
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  3 baños completos (1 privado, 1 junto a piscina, 1 compartido)
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  Piscina privada con ducha exterior
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i>
                  WiFi de alta velocidad
                </li>
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/images/propiedades/casa-principal.jpg" 
                alt="Casa Vacacional Monterrico"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Sección 2: Habitaciones Confortables - Imagen a la izquierda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden shadow-xl md:order-1">
              <img 
                src="/images/propiedades/cuartoprincipal.jpg" 
                alt="Habitaciones Confortables"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="md:order-2">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Habitaciones Confortables
              </h2>
              <p className="text-gray-600 mb-4">
                Tres amplias habitaciones diseñadas para tu máximo confort. La habitación principal cuenta con baño privado
                y aire acondicionado, perfecta para el descanso después de un día en la playa.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-bed text-primary-600 mr-3"></i>
                  Camas cómodas con ropa de cama de calidad
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-snowflake text-primary-600 mr-3"></i>
                  Aire acondicionado en habitación principal
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-door-closed text-primary-600 mr-3"></i>
                  Closets amplios en todas las habitaciones
                </li>
              </ul>
            </div>
          </div>

          {/* Sección 3: Áreas Recreativas - Imagen a la derecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Áreas Recreativas y Piscina
              </h2>
              <p className="text-gray-600 mb-4">
                Disfruta de nuestra hermosa piscina privada rodeada de áreas verdes. Perfecta para relajarte bajo el sol
                tropical o disfrutar con la familia.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-swimming-pool text-primary-600 mr-3"></i>
                  Piscina privada con área de descanso
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-umbrella-beach text-primary-600 mr-3"></i>
                  Pérgola con sillas y mesas
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-fire text-primary-600 mr-3"></i>
                  Churrasquera/BBQ para asados familiares
                </li>
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/images/propiedades/piscina.jpg" 
                alt="Piscina Privada"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Sección 4: Cocina y Áreas Comunes - Imagen a la izquierda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden shadow-xl md:order-1">
              <img 
                src="/images/propiedades/salacomedorcocina.jpg" 
                alt="Cocina y Comedor"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="md:order-2">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Cocina y Áreas Comunes
              </h2>
              <p className="text-gray-600 mb-4">
                Amplia cocina completamente equipada integrada con sala y comedor. Ideal para compartir en familia
                y preparar tus comidas favoritas.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-utensils text-primary-600 mr-3"></i>
                  Cocina equipada con refrigerador y estufa
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-couch text-primary-600 mr-3"></i>
                  Sala amplia con área de entretenimiento
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-table text-primary-600 mr-3"></i>
                  Comedor con capacidad para 10 personas
                </li>
              </ul>
            </div>
          </div>

          {/* Sección 5: Jardín y Exteriores - Imagen a la derecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Jardín y Exteriores
              </h2>
              <p className="text-gray-600 mb-4">
                Amplias áreas verdes con jardín tropical, estacionamiento techado y múltiples espacios para disfrutar
                al aire libre en un ambiente relajante y natural.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-tree text-primary-600 mr-3"></i>
                  Jardín tropical con árboles frutales
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-car text-primary-600 mr-3"></i>
                  Estacionamiento techado para múltiples vehículos
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="fas fa-leaf text-primary-600 mr-3"></i>
                  Áreas verdes para recreación
                </li>
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/images/propiedades/IMG-20251207-WA0010.jpg" 
                alt="Jardín y Áreas Verdes"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Galería compacta */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Más Fotos de la Propiedad
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <img src="/images/propiedades/cuartosecundario.jpg" alt="Habitación" className="w-full h-32 object-cover rounded-lg shadow-md" />
            <img src="/images/propiedades/baño.jpg" alt="Baño" className="w-full h-32 object-cover rounded-lg shadow-md" />
            <img src="/images/propiedades/bañopiscina.jpg" alt="Baño Piscina" className="w-full h-32 object-cover rounded-lg shadow-md" />
            <img src="/images/propiedades/pergola.jpg" alt="Pérgola" className="w-full h-32 object-cover rounded-lg shadow-md" />
            <img src="/images/propiedades/churrasquera.jpg" alt="Churrasquera" className="w-full h-32 object-cover rounded-lg shadow-md" />
            <img src="/images/propiedades/IMG-20251207-WA0013.jpg" alt="Estacionamiento" className="w-full h-32 object-cover rounded-lg shadow-md" />
          </div>
          <div className="text-center mt-8">
            <Link
              to="/reservar"
              className="inline-block text-primary-600 font-semibold hover:text-primary-700"
            >
              Ver todas las fotos en la página de reservas <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
