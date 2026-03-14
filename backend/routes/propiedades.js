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

// Debug: obtener TODOS los precios de una propiedad (sin filtro de fechas)
router.get('/:id/precios/debug/all', async (req, res) => {
  try {
    const propiedadId = req.params.id;

    const [precios] = await db.query(`
      SELECT fecha, precio, estado, comentario 
      FROM precios_noche 
      WHERE propiedad_id = ?
      ORDER BY fecha DESC
      LIMIT 100
    `, [propiedadId]);

    // Normalizar fechas al formato ISO YYYY-MM-DD
    const preciosNormalizados = precios.map(p => ({
      ...p,
      fecha: p.fecha.toISOString().split('T')[0]
    }));

    res.json({ 
      total: preciosNormalizados.length,
      precios: preciosNormalizados || []
    });
  } catch (error) {
    console.error('Error al obtener todos los precios:', error);
    res.status(500).json({ mensaje: 'Error al obtener precios' });
  }
});

// Obtener precios dinámicos para un rango de fechas
router.get('/:id/precios', async (req, res) => {
  try {
    const { fecha_entrada, fecha_salida } = req.query;
    const propiedadId = req.params.id;

    console.log(`\n📋 GET /propiedades/${propiedadId}/precios`);
    console.log(`   📅 Rango: ${fecha_entrada} a ${fecha_salida}`);

    if (!fecha_entrada || !fecha_salida) {
      return res.status(400).json({ mensaje: 'Se requieren fecha_entrada y fecha_salida' });
    }

    // Obtener precio base de la propiedad
    const [propiedades] = await db.query(
      'SELECT precio_noche FROM propiedades WHERE id = ? AND activo = TRUE',
      [propiedadId]
    );

    if (propiedades.length === 0) {
      return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
    }

    const precioBase = propiedades[0].precio_noche;
    console.log(`   💰 Precio base de propiedades: Q${precioBase}`);

    // Obtener TODOS los precios personalizados en el rango de la tabla precios_noche
    const [precios] = await db.query(`
      SELECT fecha, precio, estado, comentario 
      FROM precios_noche 
      WHERE propiedad_id = ? 
      AND fecha BETWEEN ? AND ?
      ORDER BY fecha ASC
    `, [propiedadId, fecha_entrada, fecha_salida]);

    // Normalizar fechas al formato ISO YYYY-MM-DD
    const preciosNormalizados = precios.map(p => ({
      ...p,
      fecha: p.fecha.toISOString().split('T')[0] // Convertir Date a YYYY-MM-DD
    }));

    console.log(`   📦 Precios guardados en precios_noche: ${preciosNormalizados.length}`);
    if (preciosNormalizados.length > 0) {
      preciosNormalizados.slice(0, 3).forEach(p => {
        console.log(`      • ${p.fecha}: Q${p.precio} (${p.estado})`);
      });
      if (preciosNormalizados.length > 3) {
        console.log(`      ... y ${preciosNormalizados.length - 3} más`);
      }
    }

    res.json({ 
      precioBase,
      precios: preciosNormalizados || []
    });
  } catch (error) {
    console.error('❌ Error al obtener precios:', error);
    res.status(500).json({ mensaje: 'Error al obtener precios' });
  }
});

// Obtener todas las fechas bloqueadas de una propiedad
router.get('/:id/bloqueadas', async (req, res) => {
  try {
    const propiedadId = req.params.id;

    const [bloqueadas] = await db.query(`
      SELECT fecha, comentario 
      FROM precios_noche 
      WHERE propiedad_id = ? AND estado = 'bloqueada'
      ORDER BY fecha ASC
    `, [propiedadId]);

    // Normalizar fechas al formato ISO YYYY-MM-DD
    const bloqueadasNormalizadas = bloqueadas.map(b => ({
      ...b,
      fecha: b.fecha.toISOString().split('T')[0]
    }));

    res.json({ bloqueadas: bloqueadasNormalizadas || [] });
  } catch (error) {
    console.error('Error al obtener fechas bloqueadas:', error);
    res.status(500).json({ mensaje: 'Error al obtener fechas bloqueadas' });
  }
});

// Guardar o actualizar precio de una noche
router.post('/:id/precios', async (req, res) => {
  try {
    const { fecha, precio, estado = 'disponible', comentario = '' } = req.body;
    const propiedadId = req.params.id;

    if (!fecha || precio === undefined) {
      return res.status(400).json({ mensaje: 'Se requieren fecha y precio' });
    }

    // Verificar que la propiedad existe
    const [propiedades] = await db.query(
      'SELECT id FROM propiedades WHERE id = ? AND activo = TRUE',
      [propiedadId]
    );

    if (propiedades.length === 0) {
      return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
    }

    // Intentar actualizar primero
    const [resultado] = await db.query(`
      INSERT INTO precios_noche (propiedad_id, fecha, precio, estado, comentario)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        precio = VALUES(precio),
        estado = VALUES(estado),
        comentario = VALUES(comentario),
        fecha_actualizacion = CURRENT_TIMESTAMP
    `, [propiedadId, fecha, precio, estado, comentario]);

    res.json({ 
      mensaje: 'Precio actualizado exitosamente',
      fecha,
      precio,
      estado
    });
  } catch (error) {
    console.error('Error al guardar precio:', error);
    res.status(500).json({ mensaje: 'Error al guardar precio' });
  }
});

// Actualizar múltiples precios (para el calendario del admin)
router.patch('/:id/precios', async (req, res) => {
  try {
    const { precios: actualizaciones } = req.body;
    const propiedadId = req.params.id;

    console.log(`📌 PATCH precios para propiedad ${propiedadId}`);
    console.log(`📦 Actualizaciones recibidas:`, JSON.stringify(actualizaciones, null, 2));

    if (!Array.isArray(actualizaciones) || actualizaciones.length === 0) {
      return res.status(400).json({ mensaje: 'Se requiere un array de actualizaciones' });
    }

    // Verificar que la propiedad existe
    const [propiedades] = await db.query(
      'SELECT id FROM propiedades WHERE id = ? AND activo = TRUE',
      [propiedadId]
    );

    if (propiedades.length === 0) {
      return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
    }

    let actualizadasCount = 0;

    for (const actualización of actualizaciones) {
      const { fecha, precio, estado = 'disponible', comentario = '' } = actualización;

      if (!fecha) {
        console.warn(`⚠️ Saltando actualización sin fecha`);
        continue;
      }

      console.log(`  → Guardando: ${fecha} = Q${precio} (${estado})`);

      await db.query(`
        INSERT INTO precios_noche (propiedad_id, fecha, precio, estado, comentario)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          precio = VALUES(precio),
          estado = VALUES(estado),
          comentario = VALUES(comentario),
          fecha_actualizacion = CURRENT_TIMESTAMP
      `, [propiedadId, fecha, precio, estado, comentario]);

      actualizadasCount++;
    }

    console.log(`✅ ${actualizadasCount} precios actualizados exitosamente`);

    res.json({ 
      mensaje: `${actualizadasCount} precios actualizados`,
      actualizadas: actualizadasCount
    });
  } catch (error) {
    console.error('❌ Error al actualizar precios:', error);
    res.status(500).json({ mensaje: 'Error al actualizar precios' });
  }
});

// Bloquear/desbloquear una noche
router.patch('/:id/precios/:fecha', async (req, res) => {
  try {
    const { estado, comentario = '' } = req.body;
    const { id: propiedadId, fecha } = req.params;

    if (!estado || !['disponible', 'bloqueada'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido. Usar: disponible o bloqueada' });
    }

    const [resultado] = await db.query(`
      INSERT INTO precios_noche (propiedad_id, fecha, precio, estado, comentario)
      VALUES (?, ?, (SELECT precio_noche FROM propiedades WHERE id = ?), ?, ?)
      ON DUPLICATE KEY UPDATE 
        estado = VALUES(estado),
        comentario = VALUES(comentario),
        fecha_actualizacion = CURRENT_TIMESTAMP
    `, [propiedadId, fecha, propiedadId, estado, comentario]);

    res.json({ 
      mensaje: 'Estado de la noche actualizado',
      fecha,
      estado
    });
  } catch (error) {
    console.error('Error al actualizar estado de noche:', error);
    res.status(500).json({ mensaje: 'Error al actualizar estado de noche' });
  }
});

export default router;
