const formacionRepository = require('../../Repositories/formaciones');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const formacion = req.body;
    const response = await formacionRepository.insertar(formacion);

    if (response.status === constants.SUCCEEDED_MESSAGE && response.formacion) {
      return res.status(200).json({
        status: response.status,
        mensaje: 'Formación creada correctamente.'
      });
    }

    return res.status(409).json({
      status: response.status,
      error: {
        code: response.failure_code || 409,
        message: response.failure_message || 'No se pudo crear la formación.'
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
