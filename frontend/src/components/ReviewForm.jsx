import { useState } from 'react';
import config from '../config';

const ReviewForm = ({ propiedadId = 1, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rating: 5,
    texto: ''
  });
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validación de tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe exceder 5MB');
        return;
      }

      // Validación de tipo
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Solo se permiten imágenes (JPEG, PNG, GIF)');
        return;
      }

      setImagen(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('Por favor ingresa tu nombre');
      setLoading(false);
      return;
    }

    if (!formData.texto.trim() || formData.texto.length < 10) {
      setError('La reseña debe tener al menos 10 caracteres');
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append('nombre', formData.nombre.trim());
      form.append('rating', formData.rating);
      form.append('texto', formData.texto.trim());
      form.append('propiedad_id', propiedadId);
      
      if (imagen) {
        form.append('imagen', imagen);
      }

      const response = await fetch(`${config.API_URL}/resenas`, {
        method: 'POST',
        body: form
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.mensaje || 'Error al enviar la reseña');
        setLoading(false);
        return;
      }

      setSuccess('¡Reseña publicada exitosamente! Gracias por tu comentario.');
      
      // Resetear formulario
      setFormData({
        nombre: '',
        rating: 5,
        texto: ''
      });
      setImagen(null);
      setPreview(null);

      // Callback para actualizar lista de reseñas
      if (onReviewSubmitted) {
        onReviewSubmitted(data.resena);
      }

    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal de éxito fullscreen */}
      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 sm:p-12 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full mb-4">
                <i className="fas fa-check text-4xl sm:text-5xl text-green-600"></i>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              ¡Reseña Publicada!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Gracias por compartir tu experiencia. Tu comentario será publicado próximamente en nuestro sitio.
            </p>
            <button
              onClick={() => setSuccess('')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      <div className="pt-8 sm:pt-12 md:pt-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensajes de error/éxito */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm sm:text-base text-red-700 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </p>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-2">
              Tu Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm sm:text-base"
              maxLength="100"
              disabled={loading}
            />
          </div>

          {/* Calificación */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-3">
              Calificación <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className={`text-2xl sm:text-3xl transition-transform hover:scale-110 ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  disabled={loading}
                >
                  <i className="fas fa-star"></i>
                </button>
              ))}
              <span className="ml-3 text-sm sm:text-base text-gray-600">
                {formData.rating} de 5 estrellas
              </span>
            </div>
          </div>

          {/* Texto de la reseña */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-2">
              Tu Reseña <span className="text-red-500">*</span>
            </label>
            <textarea
              name="texto"
              value={formData.texto}
              onChange={handleInputChange}
              placeholder="Cuéntanos tu experiencia. ¿Qué te gustó más? ¿Volverías?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm sm:text-base resize-none"
              rows="5"
              maxLength="1000"
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.texto.length}/1000 caracteres
            </div>
          </div>

          {/* Subida de imagen */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-gray-800 mb-3">
              Foto de tu Experiencia
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="imagen-upload"
                disabled={loading}
              />
              <label
                htmlFor="imagen-upload"
                className="flex flex-col items-center justify-center w-full px-4 py-6 sm:py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-all"
              >
                {preview ? (
                  <>
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-40 sm:max-h-48 object-contain"
                    />
                    <p className="text-xs sm:text-sm text-primary-600 mt-3 font-semibold">
                      Haz clic para cambiar imagen
                    </p>
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-3xl sm:text-4xl text-gray-400 mb-2"></i>
                    <p className="text-sm sm:text-base font-semibold text-gray-700">
                      Sube una foto de tu experiencia
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      PNG, JPG, GIF (máx. 5MB)
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Botón enviar */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Publicando...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Publicar Reseña
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Al publicar, aceptas que tu reseña puede ser mostrada públicamente en nuestro sitio.
          </p>
        </form>
        </div>
      </div>
    </>
  );
};

export default ReviewForm;
