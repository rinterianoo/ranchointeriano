// Configuración centralizada de la aplicación
const config = {
  // API URL con detección automática de entorno
  API_URL: process.env.REACT_APP_API_URL || 
          (window.location.hostname === 'localhost' 
            ? 'http://localhost:5000/api' 
            : 'https://ranchointeriano.onrender.com/api'),
  
  // Otras configuraciones
  APP_NAME: 'Rancho Interiano',
  VERSION: '1.0.0'
};

export default config;