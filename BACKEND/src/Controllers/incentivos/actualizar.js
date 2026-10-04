const incentivosRepo = require('../../Repositories/incentivos');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const { id } = req.params;
    const datos = req.body;

    // Si se cargó un nuevo archivo de resolución, incluirlo
    if (req.file) {
      datos.resolucion = req.file.filename;
    }

    const response = await incentivosRepo.actualizar(id, datos);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({ incentivo: response.incentivo });
    }

    return res.status(response.failure_code || 500).json({ status: response.status, message: response.failure_message });
  } catch (error) {
    return res.status(500).json({ status: constants.INTERNAL_ERROR_MESSAGE, message: error.message });
  }
}

module.exports = [handler]; 