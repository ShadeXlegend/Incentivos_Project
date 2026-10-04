const usuariosRepository = require('../../Repositories/usuarios');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const id_usuario = req.params.id;
    const datos = req.body;

    const response = await usuariosRepository.actualizar(id_usuario, datos);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({
        status: constants.SUCCEEDED_MESSAGE,
        mensaje: response.mensaje || 'Usuario actualizado correctamente.'
      });
    } else {
      return res.status(400).json({
        status: constants.FAILED_MESSAGE,
        error: {
          code: response.failure_code || 400,
          message: response.failure_message || 'Error al actualizar el usuario.',
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      error: {
        code: error.code || 500,
        message: error.message || 'Error interno del servidor.',
      },
    });
  }
}

module.exports = [handler];
