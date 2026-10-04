const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Magister = sequelize.define('Magister', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  docente_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  titulo: DataTypes.STRING,
  universidad: DataTypes.STRING,
  fecha_finalizacion: DataTypes.DATE,
  pais: DataTypes.STRING,
  convalidacion: DataTypes.STRING,
  resolucion_convalidacion: DataTypes.STRING,
  fecha_convalidacion: DataTypes.DATE
}, {
  tableName: 'magister',
  timestamps: false
});

module.exports = Magister;
