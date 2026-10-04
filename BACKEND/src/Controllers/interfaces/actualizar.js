const interfacesRepository = require('../../Repositories/interfaces');
const constants = require('../../../constants');

async function handler(req, res, next) {
  try {
    const { interfaces } = req.body;

    if (!Array.isArray(interfaces) || interfaces.length === 0) {
      return res.status(400).send({
        status: constants.BAD_REQUEST_MESSAGE,
        error: {
          code: 400,
          message: "Lista de interfaces no válida o vacía."
        }
      });
    }

    const response = await interfacesRepository.actualizar(interfaces);

    const statusCode = response.status === constants.SUCCEEDED_MESSAGE ? 200 : 500;

    const oResponse = {
      status: response.status
    };

    if (statusCode !== 200) {
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
