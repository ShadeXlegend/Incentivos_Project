const repo = require('../../Repositories/cualificacion');
const constants = require('../../../constants');

async function handler(req, res) {
  const id = req.params.id;
  const datos = req.body;
  const response = await repo.actualizar(id, datos);
  return res.status(200).json(response);
}

module.exports = handler;
