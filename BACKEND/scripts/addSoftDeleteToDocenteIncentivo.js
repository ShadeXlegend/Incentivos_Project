const sequelize = require('../src/config/db');

async function addSoftDeleteFields() {
  try {
    console.log('🔄 Iniciando migración: Agregando campos de soft delete a Docente_Incentivo...');
    
    // Agregar el estado ELIMINADO al ENUM
    await sequelize.query(`
      ALTER TYPE "enum_Docente_Incentivo_estado" ADD VALUE IF NOT EXISTS 'ELIMINADO';
    `);
    console.log('✅ Estado ELIMINADO agregado al enum');
    
    // Agregar campo fecha_eliminacion
    await sequelize.query(`
      ALTER TABLE "Docente_Incentivo" 
      ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMP WITH TIME ZONE;
    `);
    console.log('✅ Campo fecha_eliminacion agregado');
    
    // Agregar campo motivo_eliminacion
    await sequelize.query(`
      ALTER TABLE "Docente_Incentivo" 
      ADD COLUMN IF NOT EXISTS motivo_eliminacion TEXT;
    `);
    console.log('✅ Campo motivo_eliminacion agregado');
    
    // Agregar campo resolucion_eliminacion
    await sequelize.query(`
      ALTER TABLE "Docente_Incentivo" 
      ADD COLUMN IF NOT EXISTS resolucion_eliminacion VARCHAR(255);
    `);
    console.log('✅ Campo resolucion_eliminacion agregado');
    
    // Agregar comentarios a los campos
    await sequelize.query(`
      COMMENT ON COLUMN "Docente_Incentivo".fecha_eliminacion IS 'Fecha en que se eliminó el incentivo (soft delete)';
    `);
    
    await sequelize.query(`
      COMMENT ON COLUMN "Docente_Incentivo".motivo_eliminacion IS 'Motivo de la eliminación del incentivo';
    `);
    
    await sequelize.query(`
      COMMENT ON COLUMN "Docente_Incentivo".resolucion_eliminacion IS 'Ruta del archivo PDF de resolución de eliminación';
    `);
    console.log('✅ Comentarios agregados a los campos');
    
    console.log('🎉 Migración completada exitosamente');
    console.log('📋 Campos agregados:');
    console.log('   - Estado ELIMINADO al enum estado');
    console.log('   - fecha_eliminacion (TIMESTAMP)');
    console.log('   - motivo_eliminacion (TEXT)');
    console.log('   - resolucion_eliminacion (VARCHAR)');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addSoftDeleteFields()
    .then(() => {
      console.log('✅ Script ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando el script:', error);
      process.exit(1);
    });
}

module.exports = addSoftDeleteFields; 