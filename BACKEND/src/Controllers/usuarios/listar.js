const usuariosRepository = require('../../Repositories/usuarios');
const constants = require('../../../constants');

async function handler(req, res, next) {
  try {
    const response = await usuariosRepository.listar();

    if (response.usuarios) {
      res.status(200).json({
        status: response.status,
        usuarios: response.usuarios
      });
    } else {
      res.status(response.failure_code || 500).json({
        status: response.status,
        error: {
          code: response.failure_code || 500,
          message: response.failure_message || 'Error al obtener usuarios.',
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
