import api from './api';

export const authService = {
  // Registro de usuario
  registro: async (datos) => {
    const response = await api.post('/auth/registro', datos);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  // Obtener usuario actual
  getUsuarioActual: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Verificar si está autenticado
  estaAutenticado: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener perfil
  getPerfil: async () => {
    const response = await api.get('/auth/perfil');
    return response.data;
  }
};

export const propiedadesService = {
  // Obtener todas las propiedades
  getAll: async () => {
    const response = await api.get('/propiedades');
    return response.data;
  },

  // Obtener una propiedad
  getById: async (id) => {
    const response = await api.get(`/propiedades/${id}`);
    return response.data;
  }
};

export const reservasService = {
  // Verificar disponibilidad
  verificarDisponibilidad: async (propiedadId, fecha_entrada, fecha_salida) => {
    const response = await api.get(`/reservas/disponibilidad/${propiedadId}`, {
      params: { fecha_entrada, fecha_salida }
    });
    return response.data;
  },

  // Obtener fechas ocupadas
  getFechasOcupadas: async (propiedadId) => {
    const response = await api.get(`/reservas/fechas-ocupadas/${propiedadId}`);
    return response.data;
  },

  // Crear reserva (sin autenticación)
  crear: async (datos) => {
    const response = await api.post('/reservas', datos);
    return response.data;
  },

  // Admin: obtener todas las reservas
  getTodasReservas: async () => {
    const response = await api.get('/reservas/todas');
    return response.data;
  },

  // Admin: actualizar estado
  actualizarEstado: async (id, estado) => {
    const response = await api.patch(`/reservas/${id}/estado`, { estado });
    return response.data;
  }
};
