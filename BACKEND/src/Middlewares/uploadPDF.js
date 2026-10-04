const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta donde se guardarán los informes PDF
const uploadPath = 'uploads/reportes/';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Normalizar el nombre del archivo para evitar problemas con caracteres especiales
    const nombreNormalizado = file.originalname
      .normalize('NFD') // Descomponer caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Reemplazar caracteres especiales con guiones bajos
      .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
      .replace(/_+/g, '_'); // Reemplazar múltiples guiones bajos con uno solo
    
    const nombre = `${Date.now()}_${nombreNormalizado}`;
    cb(null, nombre);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    return cb(new Error('Formato inválido. Solo se permiten archivos .pdf'), false);
  }
  cb(null, true);
};

const uploadPDF = multer({ storage, fileFilter });

module.exports = uploadPDF; 