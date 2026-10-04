const repo = require('../../Repositories/cualificacion');
const constants = require('../../../constants');

async function handler(req, res) {
  const id = req.params.id;
  const response = await repo.eliminar(id);
  return res.status(200).json(response);
}

module.exports = handler;
