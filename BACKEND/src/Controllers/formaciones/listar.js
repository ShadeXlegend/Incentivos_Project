const formacionRepository = require('../../Repositories/formaciones');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const response = await formacionRepository.listar();

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({
        status: response.status,
        formaciones: response.formaciones
      });
    }

    return res.status(500).json({
      status: response.status,
      error: {
        code: response.failure_code || 500,
        message: response.failure_message || 'Error al listar formaciones.'
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
