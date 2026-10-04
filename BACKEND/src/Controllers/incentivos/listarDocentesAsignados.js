const incentivosRepo = require('../../Repositories/incentivos');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const { estado, tipo_incentivo, busqueda, page = 1, limit = 10 } = req.query;
    
    /*
     * Si el parámetro "estado" viene como cadena vacía («»), significa que el usuario
     * desea ver todos los estados. Por ello solo se asigna el valor por defecto
     * 'VIGENTE' cuando el parámetro viene **indefinido**. De esta manera la cadena
     * vacía se conserva y el repositorio no aplicará ningún filtro sobre este campo.
     */
    const filtros = {
      estado: estado === undefined ? 'VIGENTE' : estado,
      tipo_incentivo,
      busqueda,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const response = await incentivosRepo.listarDocentesAsignados(filtros);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      return res.status(200).json({ 
        docentes: response.docentes,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages
      });
    }

    return res.status(response.failure_code || 500).json({ 
      status: response.status, 
      message: response.failure_message 
    });
  } catch (error) {
    return res.status(500).json({ 
      status: constants.INTERNAL_ERROR_MESSAGE, 
      message: error.message 
    });
  }
}

module.exports = [handler]; 