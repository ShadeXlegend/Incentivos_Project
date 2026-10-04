const usuariosRepository = require('../../Repositories/usuarios');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const listaUsuarios = req.body; // debe ser un array

    const response = await usuariosRepository.insertarDocentesMasivo(listaUsuarios);

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      error: {
        code: error.code || 500,
        message: error.message || 'Error interno del servidor.'
      }
    });
  }
}

module.exports = [handler];
