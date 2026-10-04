const incentivosRepo = require('../../Repositories/incentivos');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const response = await incentivosRepo.listar();

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({ incentivos: response.incentivos });
    }

    return res.status(response.failure_code || 500).json({ status: response.status, message: response.failure_message });
  } catch (error) {
    return res.status(500).json({ status: constants.INTERNAL_ERROR_MESSAGE, message: error.message });
  }
}

module.exports = [handler]; 