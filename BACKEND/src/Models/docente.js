const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Docente = sequelize.define('Docente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  numero_identificacion: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  tipo_identificacion: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email_institucional: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'docente',
  timestamps: false
});

module.exports = Docente;
