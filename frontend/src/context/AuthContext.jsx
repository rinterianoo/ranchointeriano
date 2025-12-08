import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/services';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioGuardado = authService.getUsuarioActual();
    if (usuarioGuardado) {
      setUsuario(usuarioGuardado);
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUsuario(data.usuario);
    return data;
  };

  const registro = async (datos) => {
    const data = await authService.registro(datos);
    setUsuario(data.usuario);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const esAdmin = () => {
    return usuario?.rol === 'admin';
  };

  return (
    <AuthContext.Provider value={{ usuario, login, registro, logout, esAdmin, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};
