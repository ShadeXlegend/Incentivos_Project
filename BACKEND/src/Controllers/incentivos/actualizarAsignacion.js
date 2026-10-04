const incentivosRepo = require('../../Repositories/incentivos');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const { id_docente_incentivo } = req.params;
    const datos = req.body;
    
    // Obtener ruta del archivo de resolución si se subió
    if (req.file) {
      datos.resolucion = req.file.filename;
    }

    const response = await incentivosRepo.actualizarAsignacion(id_docente_incentivo, datos);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({ 
        status: response.status,
        asignacion: response.asignacion,
        message: 'Incentivo actualizado exitosamente'
      });
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