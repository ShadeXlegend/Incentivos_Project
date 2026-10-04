const repo = require('../../Repositories/cualificacion');
const constants = require('../../../constants');

async function handler(req, res) {
  const { id_usuario } = req.query

  if (!id_usuario) {
    return res.status(400).json({ error: 'ID de docente es requerido' });
  }

  try {
    const cualificaciones = await repo.obtenerCualificacionesPorUsuarioId(id_usuario);
    

    if (!cualificaciones) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    return res.status(200).json({ status: 'SUCCEEDED', cualificaciones });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener cualificaciones',error });
  }
}

module.exports = handler;
