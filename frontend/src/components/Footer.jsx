const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <i className="fas fa-umbrella-beach mr-2"></i>
              Rancho Interiano
            </h3>
            <p className="text-gray-400">
              Disfruta de unas vacaciones inolvidables en la playa de Monterrico, Guatemala.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <i className="fas fa-map-marker-alt mr-2"></i>
              Contacto
            </h3>
            <ul className="text-gray-400 space-y-2">
              <li>
                <i className="fas fa-phone mr-2"></i>
                49048991
              </li>
              <li>
                <i className="fas fa-location-dot mr-2"></i>
                Monterrico, Santa Rosa, Guatemala
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <i className="fab fa-airbnb mr-2"></i>
              Airbnb
            </h3>
            <a
              href="https://www.airbnb.mx/rooms/1601092526406882021?check_in=2026-03-27&check_out=2026-03-28&guests=1&adults=1&s=67&unique_share_id=7a2026ac-5ac4-42ec-89f4-54605680f9b9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-up-right-from-square mr-2"></i>
              Ver anuncio en Airbnb
            </a>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Rancho Interiano. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
