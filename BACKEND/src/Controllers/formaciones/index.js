const insertar = require('./insertar')
const actualizar = require('./actualizar')
const listar = require('./listar')
const eliminar = require('./eliminar')
const cargarFormacionesMasivo = require('./cargaMasiva')

module.exports = {
insertar,
actualizar,
eliminar,
listar,
cargarFormacionesMasivo
}