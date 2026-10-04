const repo = require('../../Repositories/cualificacion');
const constants = require('../../../constants');
const path = require('path');
const fs = require('fs');

async function handler(req, res) {
  try {
    const datos = req.body;
    let base64Certificado = null;

    // Si se subió un archivo (PDF), lo convertimos a base64
    if (req.file) {
      const rutaArchivo = path.join(req.file.destination, req.file.filename);
      base64Certificado = fs.readFileSync(rutaArchivo, { encoding: 'base64' });
      fs.unlinkSync(rutaArchivo); // Eliminamos archivo físico
    }
    const response = await repo.insertar({
      id_formacion: datos.id_formacion,
      id_docente: datos.id_docente,
      año_cursado: datos.cursado, 
      certificado: base64Certificado 
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error en insertar:", error);
    return res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      failure_message: 'Error interno al insertar cualificación.'
    });
  }
}

module.exports = handler;
