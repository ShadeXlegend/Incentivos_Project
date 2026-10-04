const reportesRepo = require('../../Repositories/reportes_incentivo');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const { id_docente_incentivo } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Archivo PDF no recibido' });
    }
    const ruta = req.file.path;

    const response = await reportesRepo.subir({ id_docente_incentivo, ruta_archivo: ruta });

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(201).json({ reporte: response.reporte });
    }

    return res.status(response.failure_code || 500).json({ message: response.failure_message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = [handler]; 