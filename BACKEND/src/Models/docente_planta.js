const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DocentePlanta = sequelize.define('DocentePlanta', {
  docente_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  escalafon: DataTypes.STRING,
  numero_resolucion_escalafon: DataTypes.STRING,
  fecha_resolucion_escalafon: DataTypes.DATE,
  dedicacion: DataTypes.STRING,
  nivel_academico: DataTypes.STRING,
  numero_tarjeta_profesional: DataTypes.STRING,
  resolucion_nombramiento: DataTypes.STRING,
  fecha_resolucion_nombramiento: DataTypes.DATE,
  fecha_posesion: DataTypes.DATE,
  observaciones: DataTypes.TEXT
}, {
  tableName: 'docente_planta',
  timestamps: false
});

module.exports = DocentePlanta;
