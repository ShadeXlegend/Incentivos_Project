const interfacesRepository = require('../../Repositories/interfaces');
const constants = require('../../../constants');

async function handler(req, res, next) {
  try {
    const id_usuario = req.usuario.id;

    const response = await interfacesRepository.buscarPorUsuario(id_usuario); // ← nuevo método

    const statusCode = response.status === constants.SUCCEEDED_MESSAGE ? 200 :
      response.status === constants.NOT_FOUND_ERROR_MESSAGE ? 404 : 500;

    const oResponse = {
      interfaces: response.interfaces
    };

    if (statusCode !== 200) {
      oResponse.status = response.status;
      oResponse.error = {
        code: response.failure_code,
        message: response.failure_message
      };
    }

    res.status(statusCode).send(oResponse);
  } catch (error) {
    next(error);
  }
}

module.exports = [handler];
