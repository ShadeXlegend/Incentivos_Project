const reportesRepo = require('../../Repositories/reportes_incentivo');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const response = await reportesRepo.listarPendientes();
    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({ reportes: response.reportes });
    }
    return res.status(response.failure_code || 500).json({ message: response.failure_message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = [handler]; 