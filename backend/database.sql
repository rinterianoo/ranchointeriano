-- Base de datos para Sistema de Reservas Casa Vacacional Monterrico
CREATE DATABASE IF NOT EXISTS monterrico_reservas;
USE monterrico_reservas;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'admin') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de propiedades (casa vacacional)
CREATE TABLE IF NOT EXISTS propiedades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(255),
    precio_noche DECIMAL(10,2) NOT NULL,
    capacidad_personas INT NOT NULL,
    num_habitaciones INT,
    num_banos INT,
    imagen_principal VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    propiedad_id INT NOT NULL,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    num_personas INT NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
    comentarios TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE,
    INDEX idx_fechas (fecha_entrada, fecha_salida),
    INDEX idx_estado (estado)
);

-- Tabla de imágenes de propiedades
CREATE TABLE IF NOT EXISTS imagenes_propiedad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    propiedad_id INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    orden INT DEFAULT 0,
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE
);

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador', 'admin@monterrico.com', '$2a$10$xQZHpnEqVvFHhFw5N8RxIeGlQq4J3KZJ0Vz8YRqxVTKZb5Zx5YqLq', 'admin');
-- Contraseña: admin123 (cambiar en producción)

-- Insertar propiedad de ejemplo
INSERT INTO propiedades (nombre, descripcion, direccion, precio_noche, capacidad_personas, num_habitaciones, num_banos)
VALUES (
    'Casa Vacacional Monterrico',
    'Hermosa casa frente al mar en Monterrico, Guatemala. Disfruta de la playa, piscina privada y todas las comodidades para unas vacaciones inolvidables.',
    'Monterrico, Santa Rosa, Guatemala',
    1500.00,
    8,
    3,
    2
);
