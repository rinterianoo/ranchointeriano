# Sistema de Reservas - Casa Vacacional Monterrico 🏖️

Sistema completo de gestión de reservas para casa vacacional en la playa, desarrollado con React 19 y Node.js/Express.

## 📋 Características

- ✅ Verificación de disponibilidad de fechas en tiempo real
- 📅 Sistema de reservas con calendario de fechas ocupadas
- 👤 Autenticación de usuarios con JWT
- 🔐 Panel de administración para gestión de reservas
- 📧 Envío de emails de confirmación
- 💳 Cálculo automático de precios por noche
- 📱 Diseño responsive con Tailwind CSS

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.1.0** - Librería UI
- **React Router DOM 7.8.1** - Enrutamiento SPA
- **Vite 7.0.4** - Build tool y dev server
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **Font Awesome 7.0.0** - Iconos
- **Axios 1.7.2** - Cliente HTTP

### Backend
- **Node.js** - Runtime
- **Express 4.21.2** - Framework web
- **MySQL2 3.11.5** - Cliente de base de datos
- **JWT 9.0.2** - Autenticación con tokens
- **bcryptjs 2.4.3** - Hash de contraseñas
- **Nodemailer 7.0.10** - Envío de emails
- **CORS 2.8.5** - Peticiones cross-origin
- **dotenv 16.4.7** - Variables de entorno
- **Nodemon 3.1.9** - Auto-reload en desarrollo

## 📦 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- MySQL (v8 o superior)
- NPM o Yarn

### 1. Configurar Base de Datos

```sql
-- Ejecutar el archivo database.sql en MySQL
mysql -u root -p < backend/database.sql
```

O importar manualmente desde MySQL Workbench o phpMyAdmin.

### 2. Configurar Backend

```powershell
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar el archivo .env con tus credenciales

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:5000`

### 3. Configurar Frontend

```powershell
# Abrir una nueva terminal y navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Variables de Entorno (Backend)

Editar `backend/.env`:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=monterrico_reservas
DB_PORT=3306

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRE=7d

# Email (Gmail u otro servicio SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM=Casa Monterrico <no-reply@monterrico.com>

# CORS
CLIENT_URL=http://localhost:3000
```

### Configurar Email (Gmail)

1. Ir a tu cuenta de Google
2. Habilitar "Verificación en 2 pasos"
3. Generar una "Contraseña de aplicación"
4. Usar esa contraseña en `EMAIL_PASSWORD`

## 👥 Usuarios por Defecto

### Administrador
- **Email:** admin@monterrico.com
- **Contraseña:** admin123

⚠️ **Importante:** Cambiar la contraseña del administrador en producción.

## 🚀 Uso del Sistema

### Para Clientes

1. **Registro/Login:** Crear cuenta o iniciar sesión
2. **Ver Disponibilidad:** Ir a "Reservar" y seleccionar fechas
3. **Verificar Fechas:** El sistema muestra fechas ocupadas
4. **Hacer Reserva:** Completar formulario y confirmar
5. **Mis Reservas:** Ver y gestionar reservas activas

### Para Administradores

1. **Panel Admin:** Acceder con cuenta de administrador
2. **Gestionar Reservas:** Ver todas las reservas del sistema
3. **Actualizar Estados:** Confirmar, cancelar o completar reservas
4. **Estadísticas:** Ver métricas de reservas

## 📁 Estructura del Proyecto

```
monterrico/
├── backend/
│   ├── config/
│   │   └── db.js              # Configuración MySQL
│   ├── middleware/
│   │   └── auth.js            # Middleware de autenticación
│   ├── routes/
│   │   ├── auth.js            # Rutas de autenticación
│   │   ├── propiedades.js     # Rutas de propiedades
│   │   └── reservas.js        # Rutas de reservas
│   ├── .env                   # Variables de entorno
│   ├── database.sql           # Script de base de datos
│   ├── package.json
│   └── server.js              # Servidor Express
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx     # Barra de navegación
    │   │   └── Footer.jsx     # Pie de página
    │   ├── context/
    │   │   └── AuthContext.jsx # Contexto de autenticación
    │   ├── pages/
    │   │   ├── Home.jsx       # Página de inicio
    │   │   ├── Login.jsx      # Inicio de sesión
    │   │   ├── Registro.jsx   # Registro de usuarios
    │   │   ├── Reservar.jsx   # Página de reservas
    │   │   ├── MisReservas.jsx # Reservas del usuario
    │   │   └── Admin.jsx      # Panel de administración
    │   ├── services/
    │   │   ├── api.js         # Configuración Axios
    │   │   └── services.js    # Servicios API
    │   ├── App.jsx            # Componente principal
    │   ├── main.jsx           # Punto de entrada
    │   └── index.css          # Estilos globales
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil (autenticado)

### Propiedades
- `GET /api/propiedades` - Listar propiedades
- `GET /api/propiedades/:id` - Obtener propiedad
- `POST /api/propiedades` - Crear propiedad (admin)

### Reservas
- `GET /api/reservas/disponibilidad/:propiedadId` - Verificar disponibilidad
- `GET /api/reservas/fechas-ocupadas/:propiedadId` - Obtener fechas ocupadas
- `POST /api/reservas` - Crear reserva (autenticado)
- `GET /api/reservas/mis-reservas` - Mis reservas (autenticado)
- `GET /api/reservas/todas` - Todas las reservas (admin)
- `PATCH /api/reservas/:id/estado` - Actualizar estado (admin)
- `DELETE /api/reservas/:id` - Cancelar reserva (autenticado)

## 🐛 Solución de Problemas

### Error de conexión a MySQL
- Verificar que MySQL esté corriendo
- Revisar credenciales en `.env`
- Asegurar que la base de datos existe

### Error CORS
- Verificar `CLIENT_URL` en `.env`
- Asegurar que frontend corra en el puerto correcto

### Emails no se envían
- Verificar configuración de Gmail
- Usar contraseña de aplicación, no la contraseña normal
- Revisar logs del servidor

## 📝 Notas de Desarrollo

- El sistema usa ES6 Modules (`type: "module"` en package.json)
- JWT expira en 7 días por defecto
- Contraseñas hasheadas con bcrypt (10 rounds)
- Validación de fechas en cliente y servidor
- Transacciones de base de datos para integridad

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación con JWT
- ✅ Validación de entrada en servidor
- ✅ Protección contra SQL injection (prepared statements)
- ✅ CORS configurado
- ⚠️ Cambiar `JWT_SECRET` en producción
- ⚠️ Usar HTTPS en producción

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia ISC.

## 👨‍💻 Autor

Desarrollado para Casa Vacacional Monterrico

---

¡Disfruta de tu sistema de reservas! 🏖️✨
