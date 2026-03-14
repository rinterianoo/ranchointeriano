# Guía de Debug - Precios Dinámicos

## 🔍 El Problema
El calendario no se actualiza después de guardar un precio en la tabla `precios_noche`.

## ✅ Pasos para Debugear

### 1. Abre las DevTools del Navegador
Presiona **F12** y ve a la pestaña **Console**

---

### 2. En el ADMIN - Calendario
```
✓ Abre tab "Calendario"
✓ Cambia un precio (ej: 13 de marzo de 200 a 250)
✓ Deberías ver un punto amarillo (●) indicando cambio sin guardar
✓ Haz clic en "Guardar Cambios"
```

**En la Console deberías ver logs como:**
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

Si vez esto ✅ significa que el precio se guardó correctamente en `precios_noche`.

---

### 3. En la Página de RESERVA
```
✓ Abre la página "Reservar"
✓ Selecciona las mismas fechas (13 de marzo como entrada, 14 como salida)
```

**En la Console deberías ver:**
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

---

### 4. Verifica en la Base de Datos
Abre MySQL Workbench y ejecuta:

```sql
USE monterrico_reservas;

-- Ver TODOS los precios guardados
SELECT * FROM precios_noche ORDER BY fecha DESC LIMIT 20;

-- Ver SOLO para Marzo 2026
SELECT * FROM precios_noche 
WHERE propiedad_id = 1 
AND fecha BETWEEN '2026-03-01' AND '2026-03-31'
ORDER BY fecha ASC;
```

**Deberías ver algo como:**
```
| id | propiedad_id | fecha      | precio | estado      | comentario | fecha_actualizacion |
|----|--------------|------------|--------|-------------|------------|--------------------|
| 1  | 1            | 2026-03-13 | 250    | disponible  |            | 2026-03-13 15:30  |
```

---

## 🔧 Verifica la Red (Network Tab)

En DevTools:
1. Abre pestaña **Network**
2. Filtra por: `precios`
3. Haz cambios en el calendario
4. Busca la petición **PATCH /propiedades/1/precios**

**Mira el "Request" - debe enviar:**
```json
{
  "precios": [
    {
      "fecha": "2026-03-13",
      "precio": 250,
      "estado": "disponible",
      "comentario": ""
    }
  ]
}
```

**Mira la "Response" - debe retornar:**
```json
{
  "mensaje": "1 precios actualizados",
  "actualizadas": 1
}
```

---

## 🐛 Posibles Problemas

### ❌ La Console NO muestra logs
**Problema:** Los logs de debugging no aparecen

**Solución:**
1. Asegúrate de estar en la pestaña **Console**
2. Recarga la página (Ctrl+R)
3. Intenta de nuevo

---

### ❌ La Console SÍ muestra logs PERO "Total precios en BD: 0"
**Problema:** El PATCH no guardó nada en `precios_noche`

**Causas posibles:**
1. El INSERT falló silenciosamente
2. La fecha está en formato incorrecto
3. No hay conexión a la BD

**Solución:**
1. Revisa la pestaña **Network** → PATCH request
2. Mira si hay error en la **Response**
3. Ejecuta el script SQL para ver qué hay en la BD

---

### ❌ Calendario muestra Q250 PERO solo el primer día
**Problema:** Cargó el precio pero solo para el 13, no para el 14

**Explicación correcta:**
- El 13 de marzo tiene precio Q250
- El 14 NO tiene precio en precios_noche
- Por eso usa el precio base Q1500

Para arreglarlo: cambia también el precio del 14 en el calendario

---

## 📝 Archivo SQL de Debug

Hay un archivo: `SQL_DEBUG_PRECIOS.sql` que puedes ejecutar directamente en MySQL:

```bash
mysql -u root -p monterrico_reservas < SQL_DEBUG_PRECIOS.sql
```

O copia-pega el contenido en MySQL Workbench.

---

## 📊 Flujo Correcto

```
1. Admin cambia precio → Estado local (punto amarillo ●)
2. Admin hace clic "Guardar" → PATCH /propiedades/1/precios
3. Backend: INSERT en precios_noche (con ON DUPLICATE KEY UPDATE)
4. Backend retorna: "1 precios actualizados"
5. Frontend: Recarga precios con GET /propiedades/1/precios
6. GET retorna: precios desde precios_noche
7. Admin: Calendario se actualiza con nuevo precio
8. Usuario reserva: GET también trae los precios de precios_noche
9. Total se calcula correctamente ✅
```

---

## 🚀 Próximos Pasos

Si todo funciona:
1. ✅ Los logs muestran precios en BD
2. ✅ El SQL muestra registros en precios_noche
3. ✅ El Network muestra respuestas correctas
4. ✅ El calendario y reserva muestran precios correctos

Entonces el sistema está funcionando correctamente 🎉
