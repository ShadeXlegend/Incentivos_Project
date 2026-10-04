const incentivosRepo = require('../../Repositories/incentivos');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const datos = req.body;

    // Si se cargó un archivo de resolución, agregar la ruta al cuerpo
    if (req.file) {
      datos.resolucion = req.file.filename; // Guardamos solo el nombre/relativo
    }

    const response = await incentivosRepo.insertar(datos);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(201).json({ status: response.status, incentivo: response.incentivo });
    }

    return res.status(response.failure_code || 500).json({ status: response.status, message: response.failure_message });
  } catch (error) {
    return res.status(500).json({ status: constants.INTERNAL_ERROR_MESSAGE, message: error.message });
  }
}

module.exports = [handler]; 