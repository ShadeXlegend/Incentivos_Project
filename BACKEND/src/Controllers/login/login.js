const inputValidation = require('../../Middlewares/inputValidation');
const loginRepository = require('../../Repositories/login');
const constants = require('../../../constants');

async function handler(req, res, next) {

  console.log("LOGIN RECIBIDO");
  console.log(req.body);

  try {
    const Datos = req.body;
    const response = await loginRepository.loginInfo(Datos);

    if (response.status === constants.SUCCEEDED_MESSAGE && response.token) {
      res.status(200).json({
        status: response.status,
        token: response.token,
        usuario: response.usuario,
      });
    } else {
      res.status(response.failure_code || 401).json({
        status: response.status,
        message: response.failure_message || 'Usuario o contraseña incorrectos.',

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
