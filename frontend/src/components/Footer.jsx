const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <i className="fas fa-umbrella-beach mr-2"></i>
              Casa Vacacional Monterrico
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
                <i className="fas fa-envelope mr-2"></i>
                info@monterrico.com
              </li>
              <li>
                <i className="fas fa-phone mr-2"></i>
                +502 1234-5678
              </li>
              <li>
                <i className="fas fa-location-dot mr-2"></i>
                Monterrico, Santa Rosa, Guatemala
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <i className="fas fa-share-nodes mr-2"></i>
              Síguenos
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-2xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-whatsapp text-2xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Casa Vacacional Monterrico. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
