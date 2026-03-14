# ✅ Sistema de Precios Dinámicos - GUÍA FINAL

## 📌 Resumen de Cambios

El sistema ahora consulta SIEMPRE precios desde la tabla `precios_noche`:

### 🔄 Flujo Completo

```
ADMIN → Calendario
├─ Abre tab "Calendario"
├─ Carga: GET /propiedades/1/precios (rango mes actual)
├─ Renderiza precios de `precios_noche`
├─ Modifica un precio
├─ Haz clic "Guardar Cambios"
├─ Envia: PATCH /propiedades/1/precios
├─ Backend: INSERT en `precios_noche` con ON DUPLICATE KEY UPDATE
├─ Recarga: GET /propiedades/1/precios automáticamente
└─ ✅ Calendario muestra nuevo precio

USUARIO → Página Reservar
├─ Selecciona fechas
├─ Carga: GET /propiedades/:id/precios (rango seleccionado)
├─ Calcula total sumando precios de `precios_noche`
├─ Muestra desglose: "Noche 1: Q250, Noche 2: Q200"
└─ ✅ Reserva se crea con precio correcto
```

---

## 🔧 Cambios Técnicos

### Backend - routes/propiedades.js

**GET /propiedades/:id/precios**
```javascript
// SIEMPRE retorna precios de precios_noche
// + logs detallados en console
// Respuesta:
{
  "precioBase": 1500,
  "precios": [
    { "fecha": "2026-03-13", "precio": 250, "estado": "disponible", "comentario": "" }
  ]
}
```

**PATCH /propiedades/:id/precios**
```javascript
// Inserta/actualiza en precios_noche
// + logs detallados en console
// Body: { "precios": [ { fecha, precio, estado, comentario } ] }
```

### Frontend - pages/Admin.jsx

**cargarPreciosCalendario()**
- Carga precios cada vez que abres el tab "Calendario"
- Carga cada vez que cambias de mes
- Recarga automáticamente después de guardar
- Logs detallados en Console

**guardarCambiosPrecios()**
- PATCH /propiedades/1/precios
- Limpia estados locales
- Recarga precios automáticamente

### Frontend - pages/Reservar.jsx

**calcularPrecio()**
- Carga precios dinámicos con GET /propiedades/:id/precios
- Suma precios noche por noche
- Valida que no haya fechas bloqueadas
- Logs detallados en Console

---

## 🚀 Cómo Usar

### Paso 1: Cambiar un Precio en el Calendario

1. Abre http://localhost:5173/admin-login
2. Contraseña: `rancho2024`
3. Tab "Calendario"
4. Pasa el mouse sobre una fecha
5. Cambia el precio (ej: 200 → 250)
6. Deberías ver punto amarillo (●) = cambio sin guardar
7. Haz clic "Guardar Cambios"
8. Deberías ver: "X cambios guardados exitosamente"
9. El calendario se actualiza automáticamente

### Paso 2: Verificar en Console

Abre F12 en el navegador:

```
📅 CARGANDO PRECIOS DEL CALENDARIO
   📌 Mes: Marzo 2026
   📊 Consultando: 2026-03-01 a 2026-03-31

✅ RESPUESTA DEL SERVIDOR
   💰 Precio base: Q1500
   📦 Total precios en BD: 1

📋 Precios guardados en tabla precios_noche:
      ✓ 2026-03-13: Q250 (disponible)

✓ Mapa de precios actualizado
```

### Paso 3: Hacer una Reserva

1. Abre http://localhost:5173/reservar
2. Selecciona fechas (ej: 13 al 14 de marzo)
3. En Console deberías ver:

```
🔍 CONSULTANDO PRECIOS DINÁMICOS
   📅 Desde: 2026-03-13
   📅 Hasta: 2026-03-14

✅ RESPUESTA DEL SERVIDOR
   💰 Precio base: Q1500
   📦 Precios en precios_noche: 1

📊 Precios a usar en cálculo:
   2026-03-13: Q250

💰 TOTAL: Q250.00
```

4. El total debería ser Q250 (1 noche a ese precio)

---

## 🐛 Debugging

### En Console (F12)

Logs de colores:
- 🔍 CONSULTANDO = buscando precios
- ✅ RESPUESTA = BD respondió
- 📊 PRECIOS = listado de precios
- 💰 TOTAL = total calculado
- ❌ ERROR = algo falló

### En Network (F12 > Network)

Filtra por "precios":
- GET /propiedades/1/precios → Obtener precios
- PATCH /propiedades/1/precios → Guardar precios

### En MySQL

```sql
SELECT * FROM precios_noche 
WHERE propiedad_id = 1 
AND fecha BETWEEN '2026-03-01' AND '2026-03-31'
ORDER BY fecha ASC;
```

---

## ✅ Testing Checklist

- [ ] Admin cambia precio en mes actual
- [ ] Punto amarillo aparece (indica cambio local)
- [ ] Botón "Guardar Cambios" se activa
- [ ] Haz clic guardar → mensaje de éxito
- [ ] Calendario se actualiza automáticamente
- [ ] Console muestra "Total precios en BD: 1"
- [ ] Reserva en esa fecha muestra precio correcto
- [ ] Total de reserva = suma de precios dinámicos

---

## 📁 Archivos Modificados

- ✅ `backend/routes/propiedades.js` - Endpoints de precios
- ✅ `backend/routes/reservas.js` - Integración de precios
- ✅ `frontend/src/pages/Admin.jsx` - Calendario + logs
- ✅ `frontend/src/pages/Reservar.jsx` - Cálculo dinámico + logs
- ✅ `frontend/src/services/services.js` - preciosService
- ✅ `backend/database.sql` - Tabla precios_noche

---

## 📝 Archivos de Debug

- `DEBUG_PRECIOS.md` - Guía completa de debugging
- `SQL_DEBUG_PRECIOS.sql` - Script SQL para verificar BD
- `DEBUG_CALENDAR_UPDATES.md` - Este file

---

## 🎯 Próximos Pasos (Opcional)

- [ ] Soporte para múltiples propiedades (actualmente hardcodeado ID=1)
- [ ] UI para ver/gestionar todos los precios de una vez
- [ ] Importar precios desde CSV
- [ ] Historial de cambios de precios
- [ ] Alertas si un precio es muy alto/bajo
