-- Script para corregir número de habitaciones de 3 a 2
-- Ejecutar en la base de datos de producción

UPDATE propiedades 
SET num_habitaciones = 2,
    descripcion = 'Hermosa casa vacacional en Monterrico con todas las comodidades para una estadía inolvidable.

HABITACIONES Y ESPACIOS:
• 2 habitaciones amplias y confortables
• Habitación principal con aire acondicionado
• 1 habitación secundaria espaciosa
• Capacidad para 8-10 personas
• Sala, comedor y cocina en concepto abierto

AMENIDADES:
• Piscina privada con vista al mar
• Acceso directo a la playa
• Churrasquera y área de BBQ
• Cocina completamente equipada
• Sala y comedor amplios
• Ducha exterior junto a la piscina
• Wi-Fi de alta velocidad
• Estacionamiento privado

UBICACIÓN PRIVILEGIADA:
• Primera línea de playa en Monterrico
• Vista panorámica al océano Pacífico
• Ambiente tranquilo y privado
• Cerca de restaurantes y actividades

HORARIOS:
• Check-in: 3:00 PM
• Check-out: 11:00 AM
• Aire acondicionado: 9:00 PM a 9:00 AM

El lugar perfecto para desconectarte y disfrutar de la belleza natural de Monterrico con familia y amigos.'
WHERE nombre LIKE '%Casa Vacacional Monterrico%';

-- Verificar cambios
SELECT id, nombre, num_habitaciones, num_banos 
FROM propiedades 
WHERE nombre LIKE '%Casa Vacacional Monterrico%';