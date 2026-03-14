import db from './config/db.js';

(async () => {
  try {
    // Query para obtener precios de marzo
    const [precios] = await db.query(`
      SELECT fecha, precio, estado FROM precios_noche 
      WHERE propiedad_id = 1 
      AND YEAR(fecha) = 2026 
      AND MONTH(fecha) = 3
      ORDER BY fecha ASC
      LIMIT 5
    `);
    
    console.log('PRECIOS EN LA BD:');
    precios.forEach(p => {
      console.log(`  Fecha: ${p.fecha}`);
      console.log(`  Tipo de fecha: ${p.fecha.constructor.name}`);
      console.log(`  Precio: ${p.precio}`);
      console.log(`  Estado: ${p.estado}`);
      console.log('  ---');
    });
  } catch(err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
})();
