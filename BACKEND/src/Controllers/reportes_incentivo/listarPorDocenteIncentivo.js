const constants = require('../../../constants');
const reportesRepo = require('../../Repositories/reportes_incentivo');

const listarPorDocenteIncentivo = async (req, res) => {
  try {
    const { id_docente_incentivo } = req.params;

    if (!id_docente_incentivo) {
      return res.status(400).json({
        success: false,
        message: 'ID de docente incentivo es requerido'
      });
    }

    const response = await reportesRepo.listarPorDocenteIncentivo(id_docente_incentivo);

    if (response.status !== constants.SUCCEEDED_MESSAGE) {
      return res.status(response.failure_code || 500).json({
        success: false,
        message: response.failure_message || 'Error al obtener reportes'
      });
    }

    return res.status(200).json({
      success: true,
      reportes: response.reportes
    });
  } catch (error) {
    console.error('Error en listarPorDocenteIncentivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = listarPorDocenteIncentivo; 