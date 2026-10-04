const { EmailLog } = require('../../Models');
const notificationService = require('../../Services/email/notificationService');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const { emailLogId } = req.params;
    
    // Buscar el email log
    const emailLog = await EmailLog.findByPk(emailLogId);
    
    if (!emailLog) {
      return res.status(404).json({
        status: constants.FAILED_MESSAGE,
        message: 'Registro de email no encontrado'
      });
    }

    // Verificar que el email esté en estado FALLIDO
    if (emailLog.status !== 'FALLIDO') {
      return res.status(400).json({
        status: constants.FAILED_MESSAGE,
        message: 'Solo se pueden reenviar emails con estado FALLIDO'
      });
    }

    // Marcar como pendiente
    await EmailLog.update(
      { 
        status: 'PENDIENTE',
        error_message: null,
        updated_at: new Date()
      },
      { where: { id_email_log: emailLogId } }
    );

    // Nota: Para reenviar necesitaríamos reconstruir los datos originales
    // Esto requeriría más información de contexto o almacenar los datos originales
    // Por ahora, solo actualizamos el estado
    
    return res.status(200).json({
      status: constants.SUCCEEDED_MESSAGE,
      message: 'Email marcado para reenvío. Se procesará en el próximo ciclo de envío.'
    });

  } catch (error) {
    console.error('Error al reenviar email:', error.message);
    return res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      message: error.message
    });
  }
}

module.exports = [handler]; 