const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta donde se guardarán los informes PDF
const uploadPath = 'uploads/certificados/';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const id = req.params.id || 'certificado';
    const nombre = `${id}_${Date.now()}.pdf`;
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

const uploadCertificado = multer({ storage, fileFilter });

module.exports = uploadCertificado; 