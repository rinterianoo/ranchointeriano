import { useState, useEffect } from 'react';

const ImageCarousel = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultImages = [
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

  const imagesToShow = images.length > 0 ? images : defaultImages;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imagesToShow.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [imagesToShow.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % imagesToShow.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + imagesToShow.length) % imagesToShow.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden shadow-lg">
      {/* Imágenes */}
      <div className="relative h-64 md:h-96">
        {imagesToShow.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Galería ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/propiedades/casa-principal.jpg';
              }}
            />
          </div>
        ))}

        {/* Botones de navegación */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
          aria-label="Anterior"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
          aria-label="Siguiente"
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {imagesToShow.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
