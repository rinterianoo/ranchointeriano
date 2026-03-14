import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Reviews from './pages/Reviews';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Reservar from './pages/Reservar';
import MisReservas from './pages/MisReservas';
import Admin from './pages/Admin';
import './index.css';

// Componente para proteger rutas que requieren autenticación
const RutaProtegida = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);
  
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-primary-600"></i>
      </div>
    );
  }
  
  return usuario ? children : <Navigate to="/login" />;
};

// Componente para proteger rutas de admin
const RutaAdmin = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);
  
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-primary-600"></i>
      </div>
    );
  }
  
  return usuario?.rol === 'admin' ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/reservar" element={<Reservar />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
