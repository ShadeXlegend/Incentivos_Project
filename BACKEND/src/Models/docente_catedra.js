const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DocenteCatedra = sequelize.define('DocenteCatedra', {
  docente_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  horas_contratadas: DataTypes.INTEGER,
  fecha_expedicion_cedula: DataTypes.DATE,
  resolucion_vinculacion: DataTypes.STRING,
  fecha_resolucion: DataTypes.DATE,
  docente_activo: DataTypes.BOOLEAN,
  numero_tarjeta_profesional: DataTypes.STRING,
  designacion_primer_sem: DataTypes.BOOLEAN,
  designacion_segundo_sem: DataTypes.BOOLEAN,
  observaciones: DataTypes.TEXT
}, {
  tableName: 'docente_catedra',
  timestamps: false
});

module.exports = DocenteCatedra;
