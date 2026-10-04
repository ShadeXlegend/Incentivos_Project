const formacionRepository = require('../../Repositories/formaciones');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const id = req.params.id;
    const response = await formacionRepository.eliminar(id);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({
        status: response.status,
        mensaje: 'Formación eliminada correctamente.'
      });
    }

    return res.status(404).json({
      status: response.status,
      error: {
        code: response.failure_code || 404,
        message: response.failure_message || 'Formación no encontrada.'
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      error: {
        code: error.code || 500,
        message: error.message || 'Error interno del servidor.'
      }
    });
  }
}

module.exports = [handler];
