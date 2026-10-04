const interfacesRepository = require('../../Repositories/interfaces');
const constants = require('../../../constants');

async function handler(req, res, next) {
  try {
    const response = await interfacesRepository.listarTodas();

    const statusCode = response.status === constants.SUCCEEDED_MESSAGE ? 200 : 500;

    const oResponse = {
      status: response.status,
      interfaces: response.interfaces
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
