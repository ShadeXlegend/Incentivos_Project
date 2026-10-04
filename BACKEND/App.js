const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes')(); // Asumiendo que exportas una función
const app = express();

app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));

app.use(express.json({ limit: '600mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware personalizado para manejar URLs con caracteres especiales
app.use('/uploads', (req, res, next) => {
  // Decodificar la URL para manejar caracteres especiales
  req.url = decodeURIComponent(req.url);
  next();
});

// Servir archivos estáticos de la carpeta uploads (tanto desde la raíz del proyecto como desde BACKEND/uploads)
const uploadsDirRoot = path.join(__dirname, '..', 'uploads');
const uploadsDirBackend = path.join(__dirname, 'uploads');

// Primero intentamos servir desde la carpeta raíz (para archivos guardados de forma relativa)
app.use('/uploads', express.static(uploadsDirRoot));
// Luego, si no se encuentra, intentará en la carpeta dentro de BACKEND
app.use('/uploads', express.static(uploadsDirBackend));

app.use('/', routes);

app.use((error, req, res, next) => {
  console.error(`${req.method} ${req.url} | ${error.message}`);
  console.error(error.stack);

  res.status(500).send({
    errors: [{ message: error.message }],
  });
});

module.exports = app;
