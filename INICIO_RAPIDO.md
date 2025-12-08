# Guía Rápida de Inicio 🚀

## 1️⃣ Configurar Base de Datos

```powershell
# Opción A: Desde línea de comandos
mysql -u root -p
# Luego copiar y pegar el contenido de backend/database.sql

# Opción B: Desde MySQL Workbench o phpMyAdmin
# Importar el archivo backend/database.sql
```

## 2️⃣ Instalar Backend

```powershell
cd backend
npm install
```

Editar `backend/.env` con tus credenciales de MySQL y email.

```powershell
npm run dev
```

✅ Backend corriendo en http://localhost:5000

## 3️⃣ Instalar Frontend

```powershell
# En otra terminal
cd frontend
npm install
npm run dev
```

✅ Frontend corriendo en http://localhost:3000

## 📝 Credenciales de Prueba

**Admin:**
- Email: admin@monterrico.com
- Password: admin123

**Cliente:** Crear cuenta desde la aplicación

## 🎯 Funcionalidades Principales

1. **Clientes pueden:**
   - Ver disponibilidad de fechas
   - Hacer reservas
   - Ver sus reservas
   - Cancelar reservas pendientes

2. **Administradores pueden:**
   - Ver todas las reservas
   - Confirmar/Cancelar reservas
   - Ver estadísticas
   - Gestionar estados de reservas

## ⚠️ Importante

- Asegúrate de tener MySQL corriendo
- Configura el archivo `.env` correctamente
- Para emails, usa una contraseña de aplicación de Gmail

¡Listo para usar! 🎉
