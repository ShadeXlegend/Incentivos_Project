const usuariosRepository = require('../../Repositories/usuarios');
const constants = require('../../../constants');

async function handler(req, res, next) {
  try {
    const id_usuario = req.params.id;

    const response = await usuariosRepository.eliminar(id_usuario);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      res.status(200).json({
        status: response.status,
        mensaje: response.mensaje,
      });
    } else {
      res.status(response.failure_code || 500).json({
        status: response.status,
        error: {
          code: response.failure_code || 500,
          message: response.failure_message || 'Error al eliminar el usuario.',
        },
      });
    }

  } catch (error) {
    res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      error: {
        code: error.code || 500,
        message: error.message || 'Error interno del servidor.',
      },
    });
  }
}

module.exports = [handler];
