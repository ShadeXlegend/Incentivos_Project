const incentivosRepo = require('../../Repositories/incentivos');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    // usuario regular consultará sus incentivos, el id vendrá del token
    const id_docente = req.params.idDocente || req.usuario?.id_docente;
    const response = await incentivosRepo.listarPorDocente(id_docente);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({ incentivos: response.incentivos });
    }

    return res.status(response.failure_code || 500).json({ status: response.status, message: response.failure_message });
  } catch (error) {
    return res.status(500).json({ status: constants.INTERNAL_ERROR_MESSAGE, message: error.message });
  }
}

module.exports = [handler]; 