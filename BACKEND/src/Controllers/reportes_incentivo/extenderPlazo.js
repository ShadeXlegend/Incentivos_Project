const reportesRepo = require('../../Repositories/reportes_incentivo');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const { id_docente_incentivo } = req.params;
    const { dias_extension, mensaje_administrador } = req.body;

    // Validaciones
    if (!dias_extension || dias_extension < 1 || dias_extension > 15) {
      return res.status(400).json({ 
        message: 'Los días de extensión deben estar entre 1 y 15 días' 
      });
    }

    if (!mensaje_administrador || mensaje_administrador.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Debe proporcionar un mensaje explicativo para la extensión' 
      });
    }

    const response = await reportesRepo.extenderPlazo(id_docente_incentivo, {
      dias_extension: parseInt(dias_extension),
      mensaje_administrador: mensaje_administrador.trim()
    });

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({ 
        message: 'Plazo extendido exitosamente',
        extension: response.extension 
      });
    }

    return res.status(response.failure_code || 500).json({ 
      message: response.failure_message 
    });

  } catch (error) {
    console.error('Error al extender plazo:', error);
    return res.status(500).json({ message: error.message });
  }
}

module.exports = [handler]; 