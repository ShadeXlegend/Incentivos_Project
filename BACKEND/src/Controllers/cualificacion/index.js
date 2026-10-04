const listar = require('./listar');
const insertar = require('./insertar');
const actualizar = require('./actualizar');
const eliminar = require('./eliminar');
const obtenerCualificacionesPorUsuarioId = require('./obtenerCualificacionPorUsuarioId');
const subirCertificado = require ('./subirCertificado');

module.exports = {
  listar,
  insertar,
  actualizar,
  eliminar,
  obtenerCualificacionesPorUsuarioId,
  subirCertificado,
};
