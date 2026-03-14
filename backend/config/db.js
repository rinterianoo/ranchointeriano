import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const verificarConexion = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a TiDB Cloud');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar:', error.message);
  }
};

verificarConexion();

export default pool;