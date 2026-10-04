const insertar = require('./insertar');
const listar = require('./listar');
const actualizar = require('./actualizar');
const eliminar = require('./eliminar');
const asignar = require('./asignar');
const actualizarAsignacion = require('./actualizarAsignacion');
const eliminarAsignacion = require('./eliminarAsignacion');
const listarPorDocente = require('./listarPorDocente');
const listarDocentesAsignados = require('./listarDocentesAsignados');
const obtenerEstadisticas = require('./obtenerEstadisticas');
const calcularFechasReporte = require('./calcularFechasReporte');
const obtenerMiProgreso = require('./obtenerMiProgreso');
const aprobarIncentivo = require('./aprobarIncentivo');
const desaprobarIncentivo = require('./desaprobarIncentivo');
const recordarPlazo = require('./recordarPlazo');
const getCertificado = require('./getCertificado');

module.exports = {
  insertar,
  listar,
  actualizar,
  eliminar,
  asignar,
  actualizarAsignacion,
  eliminarAsignacion,
  listarPorDocente,
  listarDocentesAsignados,
  obtenerEstadisticas,
  calcularFechasReporte,
  obtenerMiProgreso,
  aprobarIncentivo,
  desaprobarIncentivo,
  recordarPlazo,
  getCertificado,
}; 