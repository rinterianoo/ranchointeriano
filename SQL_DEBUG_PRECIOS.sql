-- Verificar que los precios se están guardando en precios_noche
-- Ejecuta esto en MySQL Workbench para debugear

USE monterrico_reservas;

-- 1. Ver TODOS los precios guardados (últimas 20 filas)
SELECT 'TODOS LOS PRECIOS EN LA BD' as 'INFO';
SELECT id, propiedad_id, fecha, precio, estado, comentario, fecha_actualizacion 
FROM precios_noche 
ORDER BY fecha DESC 
LIMIT 20;

-- 2. Ver precios para marzo 2026 solamente
SELECT '' as '';
SELECT 'PRECIOS PARA MARZO 2026' as 'INFO';
SELECT id, propiedad_id, fecha, precio, estado, comentario 
FROM precios_noche 
WHERE propiedad_id = 1 
AND YEAR(fecha) = 2026 
AND MONTH(fecha) = 3
ORDER BY fecha ASC;

-- 3. Contar cuántas filas hay en total
SELECT '' as '';
SELECT CONCAT('TOTAL DE PRECIOS: ', COUNT(*)) as 'ESTADÍSTICAS'
FROM precios_noche 
WHERE propiedad_id = 1;

-- 4. Ver el precio base de la propiedad
SELECT '' as '';
SELECT 'PRECIO BASE DE LA PROPIEDAD' as 'INFO';
SELECT id, nombre, precio_noche, activo 
FROM propiedades 
WHERE id = 1;

-- 5. Ver si la tabla existe y su estructura
SELECT '' as '';
SELECT 'ESTRUCTURA DE TABLA precios_noche' as 'INFO';
DESCRIBE precios_noche;
