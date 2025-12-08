import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generarToken, verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Registro de usuario
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, telefono, password } = req.body;

    // Validar datos
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar si el email ya existe
    const [usuarios] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length > 0) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar usuario
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, email, telefono, password, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, telefono, passwordHash, 'cliente']
    );

    // Generar token
    const token = generarToken(resultado.insertId, 'cliente');

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: resultado.insertId,
        nombre,
        email,
        rol: 'cliente'
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario
    const [usuarios] = await db.query(
      'SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const usuario = usuarios[0];

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Usuario inactivo' });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generarToken(usuario.id, usuario.rol);

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
});

// Obtener perfil del usuario autenticado
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id, nombre, email, telefono, rol, fecha_registro FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ usuario: usuarios[0] });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
});

export default router;
