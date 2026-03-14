-- Script para crear la tabla precios_noche si no existe
-- Ejecuta esto en tu cliente MySQL si aún no has creado la tabla

USE monterrico_reservas;

-- Crear tabla de precios dinámicos por noche
CREATE TABLE IF NOT EXISTS precios_noche (
    id INT PRIMARY KEY AUTO_INCREMENT,
    propiedad_id INT NOT NULL,
    fecha DATE NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    estado ENUM('disponible', 'bloqueada') DEFAULT 'disponible',
    comentario TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_fecha_propiedad (propiedad_id, fecha),
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE,
    INDEX idx_fecha_propiedad (propiedad_id, fecha)
);

-- Si la tabla ya existe, esto no hará nada
SHOW TABLES LIKE 'precios_noche';
