const formacionesRepository = require("../../Repositories/formaciones");
const constants = require("../../../constants");

async function handler(req, res) {
  try {
    const listaFormaciones = req.body;
    const response = await formacionesRepository.cargarMasivamente(
      listaFormaciones
    );

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      error: {
        code: error.code || 500,
        message: error.message || "Error interno del servidor.",
      },
    });
  }
}

module.exports = [handler];
