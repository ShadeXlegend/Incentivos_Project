require('dotenv').config(); // Cargar variables de entorno

const app = require('./App');
const sequelize = require('./src/config/db');
const scheduler = require('./src/Services/scheduler');

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando ${PORT}`);
      
      // Inicializar scheduler de tareas programadas
      scheduler.initialize();
    });

  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
  }
})();
