const path = require('path');
const DocenteIncentivo = require('../../Models/docente_incentivo');
const constants = require('../../../constants');

module.exports = async (req, res) => {
  try {
    const { id_docente_incentivo } = req.params;
    const asignacion = await DocenteIncentivo.findByPk(id_docente_incentivo);

    if (!asignacion || !asignacion.ruta_certificado) {
      return res.status(404).json({
        status: constants.NOT_FOUND_ERROR_MESSAGE,
        message: 'Certificado no encontrado'
      });
    }

    const absolutePath = path.join(__dirname, '../../..', asignacion.ruta_certificado);

    console.log("Ruta BD:", asignacion.ruta_certificado);
    console.log("Ruta absoluta:", absolutePath);

    return res.sendFile(absolutePath);
  } catch (error) {
    return res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      message: error.message
    });
  }
};