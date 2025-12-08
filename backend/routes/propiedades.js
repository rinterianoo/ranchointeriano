import express from 'express';
import db from '../config/db.js';
import { verificarToken, esAdmin } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las propiedades activas
router.get('/', async (req, res) => {
  try {
    const [propiedades] = await db.query(`
      SELECT p.*, 
        (SELECT url_imagen FROM imagenes_propiedad WHERE propiedad_id = p.id ORDER BY orden LIMIT 1) as imagen_principal
      FROM propiedades p 
      WHERE p.activo = TRUE
    `);
    
    res.json({ propiedades });
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(500).json({ mensaje: 'Error al obtener propiedades' });
  }
});

// Obtener una propiedad específica
router.get('/:id', async (req, res) => {
  try {
    const [propiedades] = await db.query('SELECT * FROM propiedades WHERE id = ? AND activo = TRUE', [req.params.id]);
    
    if (propiedades.length === 0) {
      return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
    }

    // Obtener imágenes de la propiedad
    const [imagenes] = await db.query(
      'SELECT * FROM imagenes_propiedad WHERE propiedad_id = ? ORDER BY orden',
      [req.params.id]
    );

    res.json({ 
      propiedad: propiedades[0],
      imagenes
    });
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(500).json({ mensaje: 'Error al obtener propiedad' });
  }
});

// Crear propiedad (solo admin)
router.post('/', verificarToken, esAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, direccion, precio_noche, capacidad_personas, num_habitaciones, num_banos } = req.body;

    const [resultado] = await db.query(
      'INSERT INTO propiedades (nombre, descripcion, direccion, precio_noche, capacidad_personas, num_habitaciones, num_banos) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, direccion, precio_noche, capacidad_personas, num_habitaciones, num_banos]
    );

    res.status(201).json({ 
      mensaje: 'Propiedad creada exitosamente',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    res.status(500).json({ mensaje: 'Error al crear propiedad' });
  }
});

export default router;
