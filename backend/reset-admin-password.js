import bcrypt from 'bcryptjs';
import db from './config/db.js';

const resetAdminPassword = async () => {
  try {
    const email = 'admin@monterrico.com';
    const newPassword = 'rancho2026';
    
    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Buscar si el usuario existe
    const [usuarios] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    
    if (usuarios.length === 0) {
      // Si no existe, crear nuevo usuario admin
      await db.query(
        'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
        ['Administrador', email, passwordHash, 'admin', true]
      );
      console.log('✓ Usuario admin creado exitosamente');
      console.log(`  Email: ${email}`);
      console.log(`  Contraseña: ${newPassword}`);
    } else {
      // Si existe, actualizar la contraseña
      await db.query('UPDATE usuarios SET password = ? WHERE email = ?', [passwordHash, email]);
      console.log('✓ Contraseña actualizada exitosamente');
      console.log(`  Email: ${email}`);
      console.log(`  Contraseña: ${newPassword}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdminPassword();
