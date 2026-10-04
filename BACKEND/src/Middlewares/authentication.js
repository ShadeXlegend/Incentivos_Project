// authentication.js
const jwt = require('jsonwebtoken');
const constants = require('../../constants');

function verifyToken(req, res, next) {
  let token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, constants.TOKEN_SECRET);
    req.usuario = decoded; 

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}

module.exports = verifyToken;
