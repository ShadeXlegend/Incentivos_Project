// models/Usuarios_Docentes.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario_Docente = sequelize.define('Usuario_Docente', {
  id_usuario: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true
  },
  id_docente: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true
  }
}, {
  tableName: 'Usuarios_Docentes',
  timestamps: false
});

module.exports = Usuario_Docente;
