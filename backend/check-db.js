import db from './config/db.js';

async function checkDatabase() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    const [databases] = await db.query("SELECT DATABASE()");
    console.log('✅ Base de datos actual:', databases);

    // Verificar tabla de usuarios
    const [usuarios] = await db.query("DESCRIBE usuarios");
    console.log('✅ Tabla usuarios existe');

    // Verificar tabla de propiedades
    const [propiedades] = await db.query("DESCRIBE propiedades");
    console.log('✅ Tabla propiedades existe');

    // Verificar tabla de reservas
    const [reservas] = await db.query("DESCRIBE reservas");
    console.log('✅ Tabla reservas existe');

    // Verificar tabla de precios_noche
    try {
      const [precios] = await db.query("DESCRIBE precios_noche");
      console.log('✅ Tabla precios_noche existe');
      console.log('\n📊 Estructura de precios_noche:');
      precios.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (err) {
      console.error('❌ Tabla precios_noche NO existe');
      console.log('   Ejecuta: mysql -u root -p < backend/init-db.sql');
    }

    // Verificar imagenes_propiedad
    const [imagenes] = await db.query("DESCRIBE imagenes_propiedad");
    console.log('✅ Tabla imagenes_propiedad existe');

    console.log('\n✅ ¡Base de datos verificada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nVerifica:');
    console.error('1. MySQL está corriendo');
    console.error('2. Las credenciales en .env son correctas');
    console.error('3. La base de datos monterrico_reservas existe');
    process.exit(1);
  }
}

checkDatabase();
