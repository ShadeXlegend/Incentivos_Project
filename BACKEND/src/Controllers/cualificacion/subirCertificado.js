const repo = require('../../Repositories/cualificacion');
const constants = require('../../../constants');
const fs = require('fs');
const path = require('path');

async function handler(req, res) {
  const { idCualificacion } = req.params;

  if (!req.file) {
    return res.status(400).json({
      status: constants.FAILED_MESSAGE,
      failure_message: 'No se recibió ningún archivo PDF.',
    });
  }

  const pdfPath = req.file.path;

  try {
    const fileData = fs.readFileSync(pdfPath);
    const base64 = fileData.toString('base64');

    const resultado = await repo.subirCertificado(idCualificacion, base64);

    // Eliminar el archivo físico
    fs.unlinkSync(pdfPath);

    return res.status(200).json(resultado);
  } catch (err) {
    // Eliminar el archivo en caso de error también
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    return res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      failure_message: 'Error al subir el certificado.',
      error: err.message
    });
  }
}

module.exports = handler;
