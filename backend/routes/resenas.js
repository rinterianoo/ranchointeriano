import express from 'express';
import db from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads/resenas');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para uploads de reseñas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `resena-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
  }
});

// Obtener todas las reseñas de una propiedad
router.get('/propiedad/:propiedadId', async (req, res) => {
  try {
    const { propiedadId } = req.params;
    const [resenas] = await db.query(
      `SELECT id, nombre, ubicacion, rating, texto, imagen, fecha_creacion
       FROM resenas 
       WHERE propiedad_id = ? AND activo = TRUE
       ORDER BY fecha_creacion DESC`,
      [propiedadId]
    );

    // Formatear fechas en español con el año completo
    const resnenasFormateadas = resenas.map(resena => ({
      ...resena,
      imagen: resena.imagen ? `http://localhost:5000${resena.imagen}` : null,
      fecha: new Date(resena.fecha_creacion).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }));

    res.json({ resenas: resnenasFormateadas });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ mensaje: 'Error al obtener reseñas' });
  }
});

// Crear una nueva reseña con imagen
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, ubicacion, rating, texto, propiedad_id } = req.body;

    // Validaciones
    if (!nombre || !rating || !texto || !propiedad_id) {
      if (req.file) {
        fs.unlinkSync(path.join(uploadDir, req.file.filename));
      }
      return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
    }

    if (rating < 1 || rating > 5 || isNaN(rating)) {
      if (req.file) {
        fs.unlinkSync(path.join(uploadDir, req.file.filename));
      }
      return res.status(400).json({ mensaje: 'El rating debe ser entre 1 y 5' });
    }

    // Ruta de la imagen (relativa para guardar en BD)
    const imagenUrl = req.file ? `/uploads/resenas/${req.file.filename}` : null;

    // Insertar reseña en BD
    const [result] = await db.query(
      `INSERT INTO resenas (propiedad_id, nombre, ubicacion, rating, texto, imagen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [propiedad_id, nombre, ubicacion || null, rating, texto, imagenUrl]
    );

    const now = new Date();
    const fecha = now.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    res.status(201).json({
      mensaje: '¡Reseña publicada exitosamente!',
      resena: {
        id: result.insertId,
        nombre,
        ubicacion,
        rating: parseInt(rating),
        texto,
        imagen: imagenUrl ? `http://localhost:5000${imagenUrl}` : null,
        fecha: fecha
      }
    });
  } catch (error) {
    // Limpiar archivo si hubo error
    if (req.file) {
      fs.unlinkSync(path.join(uploadDir, req.file.filename));
    }
    console.error('Error al crear reseña:', error);
    res.status(500).json({ mensaje: 'Error al crear reseña' });
  }
});

// Obtener promedios de reseñas
router.get('/propiedad/:propiedadId/promedio', async (req, res) => {
  try {
    const { propiedadId } = req.params;
    
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total,
        ROUND(AVG(rating), 1) as promedio,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as estrellas_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as estrellas_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as estrellas_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as estrellas_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as estrellas_1
       FROM resenas 
       WHERE propiedad_id = ? AND activo = TRUE`,
      [propiedadId]
    );

    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
});

export default router;
