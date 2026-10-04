const repo = require('../../Repositories/cualificacion');
const constants = require('../../../constants');

async function handler(req, res) {
  const response = await repo.listar();
  return res.status(200).json(response);
}

module.exports = handler;
