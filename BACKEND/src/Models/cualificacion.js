const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cualificacion = sequelize.define('Cualificacion', {
  id_cualificacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_docente: {
    type: DataTypes.BIGINT, 
    allowNull: false
  },
  id_formacion: {
    type: DataTypes.UUID,
    allowNull: false
  },
  año_cursado: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  certificado : {
    type: DataTypes.TEXT,
    allowNull : true
  }
}, {
  tableName: 'Cualificacion',
  timestamps: false
});

module.exports = Cualificacion;
