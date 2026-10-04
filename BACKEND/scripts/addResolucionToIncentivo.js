const sequelize = require('../src/config/db');

async function addResolucionField() {
  try {
    console.log('🔄 Iniciando migración: Agregando campo resolucion a Incentivo...');

    await sequelize.query(`
      ALTER TABLE "Incentivo"
      ADD COLUMN IF NOT EXISTS resolucion VARCHAR(255);
    `);
    console.log('✅ Campo resolucion agregado');

    await sequelize.query(`
      COMMENT ON COLUMN "Incentivo".resolucion IS 'Ruta del archivo PDF de la resolución asociada al incentivo';
    `);
    console.log('✅ Comentario agregado al campo resolucion');

    console.log('🎉 Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addResolucionField()
    .then(() => {
      console.log('✅ Script ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando el script:', error);
      process.exit(1);
    });
}

module.exports = addResolucionField; 