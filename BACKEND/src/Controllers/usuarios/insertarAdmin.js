const usuariosRepository = require('../../Repositories/usuarios');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const usuario = req.body;

    const response = await usuariosRepository.insertarAdministrador(usuario);

    if (response.usuario) {
      return res.status(200).json({
        status: response.status,
        mensaje: 'Administrador creado correctamente.',
      });
    } else {
      return res.status(400).json({
        status: response.status,
        error: {
          code: response.failure_code,
          message: response.failure_message,
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
