const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pregrado = sequelize.define('Pregrado', {
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
  pais: DataTypes.STRING
}, {
  tableName: 'pregrado',
  timestamps: false
});

module.exports = Pregrado;
