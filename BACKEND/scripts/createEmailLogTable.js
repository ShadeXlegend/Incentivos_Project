const { EmailLog } = require('../src/Models');
const sequelize = require('../src/config/db');

async function createEmailLogTable() {
  try {
    console.log('Iniciando creación de tabla email_log...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Crear la tabla
    await EmailLog.sync({ force: false });
    console.log('Tabla email_log creada exitosamente.');
    
    // Verificar que la tabla existe
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    if (tableExists.includes('email_log')) {
      console.log('Tabla email_log verificada correctamente.');
    } else {
      console.log('Error: La tabla email_log no fue creada.');
    }

    console.log('Script completado exitosamente.');
    
  } catch (error) {
    console.error('Error al crear la tabla email_log:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
if (require.main === module) {
  createEmailLogTable();
}

module.exports = createEmailLogTable; 