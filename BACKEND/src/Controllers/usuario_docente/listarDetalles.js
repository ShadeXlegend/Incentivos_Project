const usuarioDocenteRepo = require('../../Repositories/usuario_docente');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const { status, usuarios_docentes, failure_code, failure_message } = await usuarioDocenteRepo.listarConDetalle();

    if (status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({
        status,
        usuarios_docentes
      });
    }

    return res.status(failure_code || 500).json({
      status,
      error: {
        code: failure_code || 500,
        message: failure_message || 'Error al obtener usuarios_docentes.',
      },
    });

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
