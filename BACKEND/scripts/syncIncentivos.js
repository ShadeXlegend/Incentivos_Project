require('dotenv').config();
const sequelize = require('../src/config/db');

// Importar solo los modelos nuevos
const Incentivo = require('../src/Models/incentivo');
const DocenteIncentivo = require('../src/Models/docente_incentivo');
const ReporteIncentivo = require('../src/Models/reporte_incentivo');

(async () => {
  try {
    await Incentivo.sync({ alter: true });
    await DocenteIncentivo.sync({ alter: true });
    await ReporteIncentivo.sync();

    console.log('Tablas Incentivo, Docente_Incentivo y Reporte_Incentivo sincronizadas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al sincronizar tablas:', error);
    process.exit(1);
  }
})(); 