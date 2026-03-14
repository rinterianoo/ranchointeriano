import ReviewForm from '../components/ReviewForm';

const Reviews = () => {
  const propiedadId = 1; // ID de la propiedad Rancho Interiano

  const handleReviewSubmitted = () => {
    // Refresh if needed
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Reseñas de Huéspedes
          </h1>
          <p className="text-sm sm:text-base md:text-lg opacity-90">
            Cuentanos como fue tu experiencia en nuestro alojamiento
          </p>
        </div>
      </div>

      {/* Formulario de Reseña */}
      <div id="formulario-resena" className="bg-white">
        <ReviewForm 
          propiedadId={propiedadId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>


    </div>
  );
};

export default Reviews;
