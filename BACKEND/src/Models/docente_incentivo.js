const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Relación Docente ↔ Incentivo.
 * Un docente puede tener 0 o 1 incentivos vigentes.
 */
const DocenteIncentivo = sequelize.define('DocenteIncentivo', {
  id_docente_incentivo: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_docente: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_incentivo: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  estado: {
    type: DataTypes.ENUM('VIGENTE', 'FINALIZADO', 'ELIMINADO'),
    defaultValue: 'VIGENTE',
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  frecuencia_informe_dias: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  resolucion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta del archivo PDF de resolución'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales sobre la asignación'
  },
  fecha_eliminacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se eliminó el incentivo (soft delete)'
  },
  motivo_eliminacion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo de la eliminación del incentivo'
  },
  resolucion_eliminacion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta del archivo PDF de resolución de eliminación'
  },
  ruta_certificado: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Certificado final de aprobación o denegación'
  },
}, {
  tableName: 'Docente_Incentivo',
  timestamps: false,
});

module.exports = DocenteIncentivo; 