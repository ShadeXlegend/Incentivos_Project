const { sequelize } = require('../src/Models/index');

/**
 * Script para agregar nuevos valores al tipo ENUM enum_email_log_email_type
 */
(async () => {
  try {
    // Array de nuevos valores a añadir
    const newValues = [
      'INCENTIVO_COMPLETADO',
      'INCENTIVO_DENEGADO',
      'RECORDATORIO_30_DIAS',
      'RECORDATORIO_10_DIAS',
      'RECORDATORIO_1_DIAS'
    ];

    const newRelTypes = ['DOCENTE_INCENTIVO'];

    for (const value of newValues) {
      try {
        await sequelize.query(`ALTER TYPE enum_email_log_email_type ADD VALUE IF NOT EXISTS '${value}';`);
        console.log(`Valor '${value}' agregado (o ya existía).`);
      } catch (innerError) {
        console.error(`Error agregando valor '${value}':`, innerError.message);
      }
    }

    // Agregar nuevos valores al enum related_entity_type
    for (const val of newRelTypes) {
      try {
        await sequelize.query(`ALTER TYPE enum_email_log_related_entity_type ADD VALUE IF NOT EXISTS '${val}';`);
        console.log(`Valor '${val}' agregado (o ya existía) en related_entity_type.`);
      } catch (innerError) {
        console.error(`Error agregando valor '${val}' en related_entity_type:`, innerError.message);
      }
    }

    console.log('Actualización de ENUM completada');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error general al actualizar ENUM:', error.message);
    process.exit(1);
  }
})(); 