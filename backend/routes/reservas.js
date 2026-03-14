import express from 'express';
import db from '../config/db.js';
import { verificarToken, esAdmin } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verificar disponibilidad de fechas
router.get('/disponibilidad/:propiedadId', async (req, res) => {
  try {
    const { propiedadId } = req.params;
    const { fecha_entrada, fecha_salida } = req.query;

    if (!fecha_entrada || !fecha_salida) {
      return res.status(400).json({ mensaje: 'Se requieren fecha de entrada y salida' });
    }

    // Buscar reservas que se solapen con las fechas solicitadas
    const [reservas] = await db.query(`
      SELECT * FROM reservas 
      WHERE propiedad_id = ? 
      AND estado IN ('confirmada', 'pendiente')
      AND (
        (fecha_entrada <= ? AND fecha_salida >= ?)
        OR (fecha_entrada <= ? AND fecha_salida >= ?)
        OR (fecha_entrada >= ? AND fecha_salida <= ?)
      )
    `, [propiedadId, fecha_entrada, fecha_entrada, fecha_salida, fecha_salida, fecha_entrada, fecha_salida]);

    const disponible = reservas.length === 0;

    res.json({ 
      disponible,
      mensaje: disponible ? 'Fechas disponibles' : 'Las fechas seleccionadas no están disponibles',
      reservas_existentes: reservas
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ mensaje: 'Error al verificar disponibilidad' });
  }
});

// Obtener fechas ocupadas de una propiedad
router.get('/fechas-ocupadas/:propiedadId', async (req, res) => {
  try {
    const { propiedadId } = req.params;

    const [reservas] = await db.query(`
      SELECT fecha_entrada, fecha_salida 
      FROM reservas 
      WHERE propiedad_id = ? 
      AND estado IN ('confirmada', 'pendiente')
      ORDER BY fecha_entrada
    `, [propiedadId]);

    res.json({ fechas_ocupadas: reservas });
  } catch (error) {
    console.error('Error al obtener fechas ocupadas:', error);
    res.status(500).json({ mensaje: 'Error al obtener fechas ocupadas' });
  }
});

// Crear nueva reserva (sin autenticación requerida)
router.post('/', async (req, res) => {
  try {
    const { propiedad_id, fecha_entrada, fecha_salida, num_personas, comentarios, nombre, email, telefono, precio_total } = req.body;
    
    // Validar datos del cliente
    if (!nombre || !email || !telefono) {
      return res.status(400).json({ mensaje: 'Nombre, email y teléfono son obligatorios' });
    }

    // Validar datos
    if (!propiedad_id || !fecha_entrada || !fecha_salida || !num_personas) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar que la fecha de entrada sea anterior a la de salida
    if (new Date(fecha_entrada) >= new Date(fecha_salida)) {
      return res.status(400).json({ mensaje: 'La fecha de entrada debe ser anterior a la de salida' });
    }

    // Crear o buscar usuario invitado
    let usuario_id;
    const [usuariosExistentes] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    
    if (usuariosExistentes.length > 0) {
      usuario_id = usuariosExistentes[0].id;
    } else {
      // Crear usuario invitado sin contraseña
      const [nuevoUsuario] = await db.query(
        'INSERT INTO usuarios (nombre, email, telefono, password, rol) VALUES (?, ?, ?, ?, ?)',
        [nombre, email, telefono, 'sin_password_invitado', 'cliente']
      );
      usuario_id = nuevoUsuario.insertId;
    }

    // Verificar disponibilidad
    const [reservasExistentes] = await db.query(`
      SELECT * FROM reservas 
      WHERE propiedad_id = ? 
      AND estado IN ('confirmada', 'pendiente')
      AND (
        (fecha_entrada <= ? AND fecha_salida >= ?)
        OR (fecha_entrada <= ? AND fecha_salida >= ?)
        OR (fecha_entrada >= ? AND fecha_salida <= ?)
      )
    `, [propiedad_id, fecha_entrada, fecha_entrada, fecha_salida, fecha_salida, fecha_entrada, fecha_salida]);

    if (reservasExistentes.length > 0) {
      return res.status(400).json({ mensaje: 'Las fechas seleccionadas no están disponibles' });
    }

    // Obtener información de la propiedad
    const [propiedades] = await db.query('SELECT precio_noche, capacidad_personas FROM propiedades WHERE id = ?', [propiedad_id]);
    
    if (propiedades.length === 0) {
      return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
    }

    const propiedad = propiedades[0];

    // Verificar capacidad
    if (num_personas > propiedad.capacidad_personas) {
      return res.status(400).json({ 
        mensaje: `La propiedad tiene capacidad para ${propiedad.capacidad_personas} personas máximo` 
      });
    }

    // Calcular número de noches
    const entrada = new Date(fecha_entrada);
    const salida = new Date(fecha_salida);
    const noches = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
    
    // Usar precio_total enviado desde frontend, o calcular si no viene
    const precioFinal = precio_total || (noches * propiedad.precio_noche);

    // Crear reserva
    const [resultado] = await db.query(`
      INSERT INTO reservas (usuario_id, propiedad_id, fecha_entrada, fecha_salida, num_personas, precio_total, comentarios, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
    `, [usuario_id, propiedad_id, fecha_entrada, fecha_salida, num_personas, precioFinal, comentarios]);

    // Enviar email de confirmación al cliente
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Solicitud de Reserva - Casa Vacacional Monterrico',
        html: `
          <h2>Solicitud de Reserva Recibida</h2>
          <p>Hola ${nombre},</p>
          <p>Hemos recibido tu solicitud de reserva con los siguientes detalles:</p>
          <ul>
            <li><strong>Fecha de entrada:</strong> ${fecha_entrada}</li>
            <li><strong>Fecha de salida:</strong> ${fecha_salida}</li>
            <li><strong>Número de personas:</strong> ${num_personas}</li>
            <li><strong>Número de noches:</strong> ${noches}</li>
            <li><strong>Precio total:</strong> Q${precioFinal.toFixed(2)}</li>
          </ul>
          <p>Te contactaremos pronto para confirmar tu reserva.</p>
          <p>Gracias por elegir Casa Vacacional Monterrico.</p>
        `
      });
    } catch (emailError) {
      console.error('Error al enviar email al cliente:', emailError);
    }

    // Enviar notificación al administrador
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_ADMIN || process.env.EMAIL_USER, // Email del admin
        subject: '🏖️ Nueva Reserva - Casa Vacacional Monterrico',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">
              🏖️ ¡Nueva Reserva Recibida!
            </h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Detalles del Cliente:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 8px 0;"><strong>👤 Nombre:</strong> ${nombre}</li>
                <li style="margin: 8px 0;"><strong>📧 Email:</strong> ${email}</li>
                <li style="margin: 8px 0;"><strong>📱 Teléfono:</strong> ${telefono}</li>
              </ul>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">Detalles de la Reserva:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 8px 0;"><strong>📅 Entrada:</strong> ${fecha_entrada}</li>
                <li style="margin: 8px 0;"><strong>📅 Salida:</strong> ${fecha_salida}</li>
                <li style="margin: 8px 0;"><strong>👥 Personas:</strong> ${num_personas}</li>
                <li style="margin: 8px 0;"><strong>🌙 Noches:</strong> ${noches}</li>
                <li style="margin: 8px 0;"><strong>💰 Total:</strong> Q${precioFinal.toFixed(2)}</li>
                <li style="margin: 8px 0;"><strong>📋 ID Reserva:</strong> #${resultado.insertId}</li>
              </ul>
            </div>

            ${comentarios ? `
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #d97706; margin-top: 0;">💬 Comentarios del Cliente:</h3>
              <p style="margin: 0; font-style: italic;">${comentarios}</p>
            </div>
            ` : ''}

            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #dc2626; margin-top: 0;">⚠️ Acción Requerida</h3>
              <p style="margin: 10px 0;">Esta reserva está pendiente de confirmación.</p>
              <p style="margin: 0;"><strong>Por favor, revisa el panel de administración para confirmar o rechazar.</strong></p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              Casa Vacacional Monterrico<br>
              Sistema de Reservas Automático
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error al enviar notificación al administrador:', emailError);
    }

    res.status(201).json({
      mensaje: 'Reserva creada exitosamente',
      reserva: {
        id: resultado.insertId,
        fecha_entrada,
        fecha_salida,
        num_personas,
        precio_total: precioFinal,
        noches,
        estado: 'pendiente'
      }
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ mensaje: 'Error al crear reserva' });
  }
});

// Obtener reservas del usuario autenticado
router.get('/mis-reservas', verificarToken, async (req, res) => {
  try {
    const [reservas] = await db.query(`
      SELECT r.*, p.nombre as propiedad_nombre, p.direccion
      FROM reservas r
      INNER JOIN propiedades p ON r.propiedad_id = p.id
      WHERE r.usuario_id = ?
      ORDER BY r.fecha_solicitud DESC
    `, [req.usuario.id]);

    res.json({ reservas });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ mensaje: 'Error al obtener reservas' });
  }
});

// Obtener todas las reservas (admin - sin autenticación requerida)
router.get('/todas', async (req, res) => {
  try {
    const [reservas] = await db.query(`
      SELECT r.*, 
        p.nombre as propiedad_nombre,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        u.telefono as usuario_telefono
      FROM reservas r
      INNER JOIN propiedades p ON r.propiedad_id = p.id
      INNER JOIN usuarios u ON r.usuario_id = u.id
      ORDER BY r.fecha_solicitud DESC
    `);

    res.json({ reservas });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ mensaje: 'Error al obtener reservas' });
  }
});

// Actualizar estado de reserva (admin - sin autenticación requerida)
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const { id } = req.params;

    if (!['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido' });
    }

    await db.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id]);

    // Obtener información de la reserva para enviar email
    const [reservas] = await db.query(`
      SELECT r.*, u.nombre, u.email, p.nombre as propiedad_nombre
      FROM reservas r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      INNER JOIN propiedades p ON r.propiedad_id = p.id
      WHERE r.id = ?
    `, [id]);

    if (reservas.length > 0) {
      const reserva = reservas[0];
      
      // Enviar email de actualización
      try {
        let asunto = '';
        let mensaje = '';

        if (estado === 'confirmada') {
          asunto = 'Reserva Confirmada - Casa Vacacional Monterrico';
          mensaje = `
            <h2>¡Tu Reserva ha sido Confirmada!</h2>
            <p>Hola ${reserva.nombre},</p>
            <p>Tu reserva para ${reserva.propiedad_nombre} ha sido confirmada.</p>
            <p><strong>Detalles de tu reserva:</strong></p>
            <ul>
              <li><strong>Fecha de entrada:</strong> ${reserva.fecha_entrada}</li>
              <li><strong>Fecha de salida:</strong> ${reserva.fecha_salida}</li>
              <li><strong>Número de personas:</strong> ${reserva.num_personas}</li>
              <li><strong>Precio total:</strong> Q${reserva.precio_total}</li>
            </ul>
            <p>Te esperamos en Casa Vacacional Monterrico.</p>
          `;
        } else if (estado === 'cancelada') {
          asunto = 'Reserva Cancelada - Casa Vacacional Monterrico';
          mensaje = `
            <h2>Reserva Cancelada</h2>
            <p>Hola ${reserva.nombre},</p>
            <p>Tu reserva para ${reserva.propiedad_nombre} ha sido cancelada.</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          `;
        }

        if (asunto) {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: reserva.email,
            subject: asunto,
            html: mensaje
          });
        }
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
      }
    }

    res.json({ mensaje: 'Estado de reserva actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ mensaje: 'Error al actualizar estado de reserva' });
  }
});

// Cancelar reserva (usuario)
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    // Verificar que la reserva pertenece al usuario (a menos que sea admin)
    const [reservas] = await db.query('SELECT * FROM reservas WHERE id = ?', [id]);
    
    if (reservas.length === 0) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    if (reservas[0].usuario_id !== usuario_id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permiso para cancelar esta reserva' });
    }

    await db.query('UPDATE reservas SET estado = ? WHERE id = ?', ['cancelada', id]);

    res.json({ mensaje: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ mensaje: 'Error al cancelar reserva' });
  }
});

export default router;
