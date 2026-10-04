const scheduler = require('../../Services/scheduler');

async function handler(req, res) {
  try {
    console.log('🔄 Ejecutando verificación manual de recordatorios...');
    
    const result = await scheduler.executeReminderCheckManually();
    
    if (result.success) {
      return res.status(200).json({
        message: 'Recordatorios procesados exitosamente',
        processed: result.processed,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        message: 'Error al procesar recordatorios',
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('Error en ejecutar recordatorios:', error.message);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}

module.exports = [handler]; 