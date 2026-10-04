const emailService = require('../../Services/email/emailService');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const result = await emailService.verifyConnection();
    
    if (result.success) {
      return res.status(200).json({
        status: constants.SUCCEEDED_MESSAGE,
        message: result.message,
        connectionValid: true
      });
    } else {
      return res.status(500).json({
        status: constants.INTERNAL_ERROR_MESSAGE,
        message: result.message,
        connectionValid: false
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      message: error.message,
      connectionValid: false
    });
  }
}

module.exports = [handler]; 