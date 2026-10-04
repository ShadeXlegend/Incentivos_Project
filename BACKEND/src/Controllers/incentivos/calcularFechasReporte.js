const incentivosRepo = require('../../Repositories/incentivos');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const { id_docente_incentivo } = req.params;
    
    const response = await incentivosRepo.calcularFechasReporte(id_docente_incentivo);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({ fechas: response.fechas, reportes: response.reportes });
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