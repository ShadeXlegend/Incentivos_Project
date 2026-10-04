const multer = require('multer');
const path = require('path');
const fs = require ('fs')
// Configuración del almacenamiento
const uploadPath = 'uploads/';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

// Filtro para permitir solo Excel y CSV
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedTypes.includes(ext)) {
    return cb(new Error('Formato inválido. Solo se permiten archivos .xlsx, .xls o .csv'), false);
  }

  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
