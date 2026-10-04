const incentivosRepo = require('../../Repositories/incentivos');
const constants = require('../../../constants');
const { Usuario_Docente } = require('../../Models');

async function handler(req, res) {
  try {
    // Obtener el id_usuario del token JWT
    const id_usuario = req.usuario?.id;
    
    if (!id_usuario) {
      return res.status(400).json({ 
        status: constants.INVALID_PARAMETER_SENDED,
        message: 'No se pudo identificar al usuario' 
      });
    }

    // Buscar el docente asociado al usuario
    const usuarioDocente = await Usuario_Docente.findOne({
      where: { id_usuario }
    });

    if (!usuarioDocente) {
      return res.status(400).json({ 
        status: constants.INVALID_PARAMETER_SENDED,
        message: 'No se pudo identificar al docente' 
      });
    }

    const response = await incentivosRepo.obtenerProgreso(usuarioDocente.id_docente);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({ progreso: response.progreso });
    }

    return res.status(response.failure_code || 500).json({ 
      status: response.status, 
      message: response.failure_message 
    });
  } catch (error) {
    return res.status(500).json({ 
      status: constants.INTERNAL_ERROR_MESSAGE, 
      message: error.message 
    });
  }
}

module.exports = [handler]; 