const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DocenteDetalle = sequelize.define('DocenteDetalle', {
  docente_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  facultad: DataTypes.STRING,
  programa_adscrito: DataTypes.STRING,
  municipio: DataTypes.STRING,
  modalidad: DataTypes.STRING
}, {
  tableName: 'docente_detalle',
  timestamps: false
});

module.exports = DocenteDetalle;
